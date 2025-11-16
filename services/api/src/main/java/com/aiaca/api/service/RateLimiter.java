package com.aiaca.api.service;

import com.aiaca.api.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimiter {
    private final Map<String, Deque<Long>> requests = new ConcurrentHashMap<>();
    private final int maxRequests = 5;
    private final long windowMs = 60_000;

    public void assertWithinLimit(String key) {
        long now = Instant.now().toEpochMilli();
        requests.putIfAbsent(key, new ArrayDeque<>());
        Deque<Long> times = requests.get(key);
        while (!times.isEmpty() && now - times.peekFirst() > windowMs) {
            times.pollFirst();
        }
        if (times.size() >= maxRequests) {
            throw new BadRequestException("Rate limit exceeded for public scans. Please try again soon.");
        }
        times.addLast(now);
    }
}
