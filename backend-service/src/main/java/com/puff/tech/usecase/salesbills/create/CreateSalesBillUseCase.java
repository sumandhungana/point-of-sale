package com.puff.tech.usecase.salesbills.create;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.SalesBillConvertor;
import com.puff.tech.repository.CustomerRepository;
import com.puff.tech.repository.SalesBillRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class CreateSalesBillUseCase implements UseCases<CreateSalesBillUseCaseRequest,CreateSalesBillUseCaseResponse> {

    private final SalesBillRepository salesBillRepository;
    private final CustomerRepository customerRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public CreateSalesBillUseCase(SalesBillRepository salesBillRepository,
                                  CustomerRepository customerRepository,
                                  KhataBookImplementation khataBookImplementation) {
        this.salesBillRepository = salesBillRepository;
        this.customerRepository = customerRepository;
        this.khataBookImplementation = khataBookImplementation;
    }

    @Override
    public Mono<CreateSalesBillUseCaseResponse> execute(CreateSalesBillUseCaseRequest request) {
        return customerRepository.findById(request.customerId())
                .switchIfEmpty(Mono.error(new RuntimeException("Customer not found")))
                .flatMap(customer->khataBookImplementation.getCurrentKhataBookId()
                        .flatMap(khataBookId->{
                            var salesBill= SalesBillConvertor.toEntity(request,khataBookId);
                            return salesBillRepository.save(salesBill)
                                    .map(salesBillEntity -> new CreateSalesBillUseCaseResponse("Bill created"))
                                    .onErrorResume(err->Mono.error(new RuntimeException("Unexpected happened " +err.getLocalizedMessage())));
                        }));
    }
}
