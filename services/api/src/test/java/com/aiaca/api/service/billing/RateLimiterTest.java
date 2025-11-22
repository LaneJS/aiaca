package com.aiaca.api.service.billing;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.aiaca.api.service.RateLimiter;
import org.junit.jupiter.api.Test;

class RateLimiterTest {

    @Test
    void assertWithinLimit_throwsAfterExceedingWindow() {
        RateLimiter limiter = new RateLimiter(2, 10_000);

        limiter.assertWithinLimit("account-1");
        limiter.assertWithinLimit("account-1");

        assertThatThrownBy(() -> limiter.assertWithinLimit("account-1"))
                .isInstanceOf(com.aiaca.api.exception.RateLimitExceededException.class);
    }
}
