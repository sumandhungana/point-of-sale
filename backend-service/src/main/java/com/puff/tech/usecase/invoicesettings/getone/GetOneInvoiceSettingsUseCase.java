package com.puff.tech.usecase.invoicesettings.getone;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.InvoiceSettingsConvertor;
import com.puff.tech.repository.InvoiceSettingRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import com.puff.tech.usecase.invoicesettings.get.GetInvoiceSettingsUseCaseResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class GetOneInvoiceSettingsUseCase implements UseCase<GetOneInvoiceSettingsUseCaseRequest, GetInvoiceSettingsUseCaseResponse> {

    private final InvoiceSettingRepository invoiceSettingRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetOneInvoiceSettingsUseCase(InvoiceSettingRepository invoiceSettingRepository,
                                        KhataBookImplementation khataBookImplementation) {
        this.invoiceSettingRepository = invoiceSettingRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<GetInvoiceSettingsUseCaseResponse> execute(GetOneInvoiceSettingsUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        invoiceSettingRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .map(InvoiceSettingsConvertor::toResponse)
                                .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened"+ err.getLocalizedMessage())))
                        );
    }
}
