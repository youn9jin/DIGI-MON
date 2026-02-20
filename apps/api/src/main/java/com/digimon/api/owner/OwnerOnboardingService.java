package com.digimon.api.owner;

import com.digimon.api.auth.FirebaseTokenService;
import com.digimon.api.auth.UnauthorizedException;
import com.digimon.api.global.ValidationErrorDetail;
import com.digimon.api.global.ValidationErrorException;
import com.digimon.api.owner.dto.*;
import com.digimon.api.user.Role;
import com.digimon.api.user.User;
import com.digimon.api.user.UserRepository;
import com.digimon.api.user.UserService;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OwnerOnboardingService {

    private static final String INDUSTRY_TAG_VALUES = "WHOLESALE_RETAIL, ELECTRONICS_MANUFACTURING, AGRICULTURE_FORESTRY_FISHERY, PROFESSIONAL_SCI_TECH, ACCOMMODATION_FOOD";
    private static final String AGE_GROUP_VALUES = "AGE_10S, AGE_20S, AGE_30S, AGE_40S, AGE_50S, AGE_60_PLUS";

    private final FirebaseTokenService firebaseTokenService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final OwnerProfileRepository ownerProfileRepository;

    public OwnerOnboardingService(FirebaseTokenService firebaseTokenService,
                                  UserService userService,
                                  UserRepository userRepository,
                                  OwnerProfileRepository ownerProfileRepository) {
        this.firebaseTokenService = firebaseTokenService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.ownerProfileRepository = ownerProfileRepository;
    }

    public User resolveCurrentUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        String idToken = authorization.substring("Bearer ".length()).trim();
        try {
            FirebaseToken decoded = firebaseTokenService.verify(idToken);
            return userService.getOrCreateFromFirebase(decoded);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or missing token");
        }
    }

    @Transactional
    public OwnerOnboardingResult onboardOwner(User user, OwnerOnboardingRequest request) {
        List<ValidationErrorDetail> errors = new ArrayList<>();

        String industryTag = request.getIndustryTag() == null ? "" : request.getIndustryTag().trim();
        String ageGroup = request.getAgeGroup() == null ? "" : request.getAgeGroup().trim();
        String storeName = request.getStoreName() == null ? "" : request.getStoreName().trim();
        String countryCode = request.getLocation() != null && request.getLocation().getCountryCode() != null
                ? request.getLocation().getCountryCode().trim()
                : "";
        String adminArea = request.getLocation() != null && request.getLocation().getAdminArea() != null
                ? request.getLocation().getAdminArea().trim()
                : "";

        if (industryTag.isEmpty()) {
            errors.add(new ValidationErrorDetail("industryTag", "must not be blank"));
        } else {
            try {
                IndustryTag.valueOf(industryTag);
            } catch (IllegalArgumentException e) {
                errors.add(new ValidationErrorDetail("industryTag", "must be one of [" + INDUSTRY_TAG_VALUES + "]"));
            }
        }
        if (ageGroup.isEmpty()) {
            errors.add(new ValidationErrorDetail("ageGroup", "must not be blank"));
        } else {
            try {
                AgeGroup.valueOf(ageGroup);
            } catch (IllegalArgumentException e) {
                errors.add(new ValidationErrorDetail("ageGroup", "must be one of [" + AGE_GROUP_VALUES + "]"));
            }
        }
        if (storeName.isEmpty()) {
            errors.add(new ValidationErrorDetail("storeName", "must not be blank"));
        }
        if (countryCode.isEmpty()) {
            errors.add(new ValidationErrorDetail("location.countryCode", "must not be blank"));
        } else if (!countryCode.matches("^[A-Z]{2}$")) {
            errors.add(new ValidationErrorDetail("location.countryCode", "must be 2 uppercase letters (ISO alpha-2)"));
        }
        if (adminArea.isEmpty()) {
            errors.add(new ValidationErrorDetail("location.adminArea", "must not be blank"));
        }

        LocalDate openedAt = request.getOpenedAt();
        if (openedAt != null && openedAt.isAfter(LocalDate.now())) {
            errors.add(new ValidationErrorDetail("openedAt", "must not be a future date"));
        }

        if (!errors.isEmpty()) {
            throw new ValidationErrorException(errors);
        }

        if (user.getRole() != Role.OWNER) {
            user.setRole(Role.OWNER);
        }
        user.setOnboarded(true);
        userRepository.save(user);

        boolean created;
        OwnerProfile profile = ownerProfileRepository.findById(user.getId()).orElse(null);
        if (profile == null) {
            profile = new OwnerProfile();
            profile.setUser(user);
            profile.setCreatedAt(OffsetDateTime.now());
            created = true;
        } else {
            created = false;
        }

        profile.setStoreName(storeName);
        profile.setBusinessType(industryTag);
        profile.setAgeGroup(ageGroup);
        profile.setCountryCode(countryCode);
        profile.setRegionText(adminArea);
        profile.setOpenedAt(openedAt);
        profile.setUpdatedAt(OffsetDateTime.now());
        profile.setLatitude(null);
        profile.setLongitude(null);
        ownerProfileRepository.save(profile);

        OwnerOnboardingResponse response = toResponse(user, profile);
        return new OwnerOnboardingResult(created, response);
    }

    private static OwnerOnboardingResponse toResponse(User user, OwnerProfile profile) {
        LocationResponse location = new LocationResponse(
                profile.getCountryCode(),
                profile.getRegionText()
        );
        OwnerProfileResponse ownerProfileResponse = new OwnerProfileResponse(
                profile.getStoreName(),
                profile.getBusinessType(),
                profile.getAgeGroup(),
                location,
                profile.getOpenedAt()
        );
        return new OwnerOnboardingResponse(
                user.getId(),
                Role.OWNER.name(),
                true,
                ownerProfileResponse
        );
    }
}
