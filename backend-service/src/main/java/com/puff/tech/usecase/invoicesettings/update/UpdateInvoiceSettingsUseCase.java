package com.puff.tech.usecase.invoicesettings.update;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.InvoiceSettingsConvertor;
import com.puff.tech.repository.InvoiceSettingRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateInvoiceSettingsUseCase implements UseCases<UpdateInvoiceSettingsUseCaseRequest, UpdateInvoiceSettingsUseCaseResponse> {

    private final InvoiceSettingRepository invoiceSettingRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public UpdateInvoiceSettingsUseCase(InvoiceSettingRepository invoiceSettingRepository,
                                        KhataBookImplementation khataBookImplementation) {
        this.invoiceSettingRepository = invoiceSettingRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<UpdateInvoiceSettingsUseCaseResponse> execute(UpdateInvoiceSettingsUseCaseRequest request) {
        return khataBookImplementation.getCurrentKhataBookId()
                .flatMap(khataBookId->
                        invoiceSettingRepository.findByIdAndKhataBookId(request.id(), khataBookId)
                                .switchIfEmpty(Mono.error(new RuntimeException("Income not found")))
                                .flatMap(existing->{
                                            var updated= InvoiceSettingsConvertor.toUpdateEntity(request,existing);
                                            return invoiceSettingRepository.update(updated)
                                                    .map(invoice->new UpdateInvoiceSettingsUseCaseResponse("Income updated successfully"));
                                        }
                                ));
    }
}
