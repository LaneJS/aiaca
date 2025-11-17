package com.aiaca.api.service;

import com.aiaca.api.exception.RateLimitExceededException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimiter {
    private final Map<String, Deque<Long>> requests = new ConcurrentHashMap<>();
    private final int maxRequests;
    private final long windowMs;

    public RateLimiter(@Value("${security.public-scan.rate-limit.max-requests:5}") int maxRequests,
                       @Value("${security.public-scan.rate-limit.window-ms:60000}") long windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    public void assertWithinLimit(String key) {
        long now = Instant.now().toEpochMilli();
        requests.putIfAbsent(key, new ArrayDeque<>());
        Deque<Long> times = requests.get(key);
        while (!times.isEmpty() && now - times.peekFirst() > windowMs) {
            times.pollFirst();
        }
        if (times.size() >= maxRequests) {
            throw new RateLimitExceededException(String.format("Rate limit exceeded (%d requests / %d seconds)",
                    maxRequests, windowMs / 1000));
        }
        times.addLast(now);
    }

    public int getMaxRequests() {
        return maxRequests;
    }

    public long getWindowMs() {
        return windowMs;
    }
}
