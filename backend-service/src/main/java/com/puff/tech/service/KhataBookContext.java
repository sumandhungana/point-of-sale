package com.puff.tech.service;

import io.micronaut.http.HttpRequest;
import reactor.core.publisher.Mono;

public interface KhataBookContext {
    Mono<Integer> getCurrentKhataBookId();
    Mono<Void> setCurrentKhataBookId(Integer khataBoookId);
    Mono<Boolean> validateKhataBookAccess(Integer khataBookId);
}
