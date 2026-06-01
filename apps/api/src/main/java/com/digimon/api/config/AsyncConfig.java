package com.digimon.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * 비동기 / 스케줄러 활성화 설정.
 *
 * - {@link EnableAsync} : MarketPageGenerationService 의 @Async 메서드 동작에 필수.
 * - {@link EnableScheduling} : MarketPageScheduler 의 @Scheduled 동작에 필수.
 *
 * 별도 빈으로 분리한 이유: ApiApplication 을 가능한 단순하게 유지하고, 동시성 인프라를
 * 이 한 파일에서 일괄 관리하기 위함.
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    /**
     * @Async 전용 executor. 별도로 정의하지 않으면 Spring 이 SimpleAsyncTaskExecutor 로
     * 매 호출마다 새 스레드를 만들기 때문에, 동시 생성 요청이 몰릴 경우 스레드 폭주 위험이 있다.
     * 풀 사이즈는 작게 시작 (CPU 바운드가 아니라 외부 I/O 대기가 대부분).
     */
    @Bean(name = "marketPageAsyncExecutor")
    public TaskExecutor marketPageAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("market-page-");
        executor.initialize();
        return executor;
    }
}
