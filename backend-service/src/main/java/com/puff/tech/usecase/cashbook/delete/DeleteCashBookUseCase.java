package com.puff.tech.usecase.cashbook.delete;

import com.puff.tech.core.utils.HelperUtils;
import com.puff.tech.repository.CashBookRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Singleton
public class DeleteCashBookUseCase {

    private final CashBookRepository cashBookRepository;
    private final HelperUtils helperUtils;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteCashBookUseCase(CashBookRepository cashBookRepository,
                                 HelperUtils helperUtils,
                                 KhataBookImplementation khataBookImplementation) {
        this.cashBookRepository = cashBookRepository;
        this.helperUtils = helperUtils;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Mono<DeleteCashBookUseCaseResponse> execute(Integer id) {

        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId ->

                        cashBookRepository.findByIdAndKhataBookId(id, khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Cashbook not found")))

                                //  Delete Photo if exists
                                .flatMap(existing -> {

                                    if (existing.getPhotoPath() != null) {
                                        return Mono.fromRunnable(() ->
                                                        helperUtils.deleteFile(existing.getPhotoPath())
                                                )
                                                .subscribeOn(Schedulers.boundedElastic())
                                                .thenReturn(existing);
                                    }

                                    return Mono.just(existing);
                                })

                                //  Delete from DB
                                .flatMap(existing ->
                                        cashBookRepository.delete(existing)
                                                .thenReturn(new DeleteCashBookUseCaseResponse(
                                                        "Cashbook deleted successfully"
                                                ))
                                )
                );
    }
}