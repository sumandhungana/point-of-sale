package com.puff.tech.usecase.invoicesettings.create;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.covertor.InvoiceSettingsConvertor;
import com.puff.tech.repository.InvoiceSettingRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateInvoiceSettingsUseCase implements UseCase<CreateInvoiceSettingsUseCaseRequest, CreateInvoiceSettingsUseCaseResponse> {

    private final InvoiceSettingRepository invoiceSettingRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateInvoiceSettingsUseCase(InvoiceSettingRepository invoiceSettingRepository,
                                        KhataBookImplementation khataBookImplementation) {
        this.invoiceSettingRepository = invoiceSettingRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateInvoiceSettingsUseCaseResponse> execute(CreateInvoiceSettingsUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId-> {
                            var invoice= InvoiceSettingsConvertor.toEntity(request,khataBookId);
                            return invoiceSettingRepository.save(invoice)
                                    .map(invoiceSettingsEntity -> new CreateInvoiceSettingsUseCaseResponse("Invoice settings created"))
                                    .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened"+ err.getLocalizedMessage())));

                        }

                        );
    }
}
