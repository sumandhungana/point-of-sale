package com.puff.tech.usecase.invoicesettings.get;

import com.puff.tech.covertor.InvoiceSettingsConvertor;
import com.puff.tech.repository.InvoiceSettingRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllInvoiceSettingsUseCase {
    private final InvoiceSettingRepository invoiceSettingRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetAllInvoiceSettingsUseCase(InvoiceSettingRepository invoiceSettingRepository,
                                        KhataBookImplementation khataBookImplementation) {
        this.invoiceSettingRepository = invoiceSettingRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    public Flux<GetInvoiceSettingsUseCaseResponse> execute(){
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMapMany(khataBookId->
                        invoiceSettingRepository.findByKhataBookIdOrderByCreatedAtDesc(khataBookId)
                                .map(InvoiceSettingsConvertor::toResponse)
                                .onErrorResume(err->Flux.error(new RuntimeException("Unexpected happened" +err.getLocalizedMessage())))
                );
    }
}
