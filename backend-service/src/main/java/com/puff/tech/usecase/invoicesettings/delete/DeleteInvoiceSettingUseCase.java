package com.puff.tech.usecase.invoicesettings.delete;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.repository.InvoiceSettingRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteInvoiceSettingUseCase implements UseCase<DeleteInvoiceSettingUseCaseRequest,DeleteInvoiceSettingUseCaseResponse> {

    private final InvoiceSettingRepository invoiceSettingRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public DeleteInvoiceSettingUseCase(InvoiceSettingRepository invoiceSettingRepository,
                                       KhataBookImplementation khataBookImplementation) {
        this.invoiceSettingRepository = invoiceSettingRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<DeleteInvoiceSettingUseCaseResponse> execute(DeleteInvoiceSettingUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        invoiceSettingRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Invoice settings not available")))
                                .flatMap(invoiceSettingsEntity -> {
                                    return invoiceSettingRepository.deleteById(request.id())
                                            .then(Mono.just(new DeleteInvoiceSettingUseCaseResponse("Invoice settings deleted successfully")));
                                        }

                                )
                );
    }
}
