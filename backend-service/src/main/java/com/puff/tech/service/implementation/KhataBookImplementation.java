package com.puff.tech.service.implementation;
import com.puff.tech.entity.KhataBookEntity;
import com.puff.tech.repository.KhataBookRepository;
import com.puff.tech.service.KhataBookContext;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.context.ServerRequestContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;



@Singleton
public class KhataBookImplementation implements KhataBookContext {

    private final KhataBookRepository khataBookRepository;

    @Inject
    public KhataBookImplementation(KhataBookRepository khataBookRepository) {
        this.khataBookRepository = khataBookRepository;
    }


    @Override
    public Mono<Integer> getCurrentKhataBookId() {
        return Mono.defer(() -> {
            HttpRequest<?> request = ServerRequestContext.currentRequest()
                    .orElseThrow(() -> new IllegalStateException("No active request"));

            // Wrap header value in Mono
            return Mono.justOrEmpty(request.getHeaders().get("X-KhataBook-Id"))
                    .flatMap(headerValue -> {
                        try {
                            int id = Integer.parseInt(headerValue);
                            return id > 0 ? Mono.just(id) : Mono.empty();
                        } catch (NumberFormatException e) {
                            return Mono.empty();
                        }
                    })
                    // If no valid header, try DB fallback
                    .switchIfEmpty(
                            khataBookRepository.findByUsedTrue()
                                    .switchIfEmpty(
                                            khataBookRepository.findFirstKhataBook()
                                                    .flatMap(first -> {
                                                        first.setUsed(true);
                                                        return khataBookRepository.save(first);
                                                    })
                                    )
                                    .map(KhataBookEntity::getId)
                    )
                    // Ultimate fallback
                    .defaultIfEmpty(1);
        });
    }

    @Override
    public Mono<Void> setCurrentKhataBookId(Integer khataBoookId) {
        return Mono.empty();
    }

    @Override
    public Mono<Boolean> validateKhataBookAccess(Integer khataBookId) {
        return khataBookRepository.existsById(khataBookId);
    }
}
