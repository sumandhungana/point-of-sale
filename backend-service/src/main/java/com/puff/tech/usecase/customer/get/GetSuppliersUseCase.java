package com.puff.tech.usecase.customer.get;

import com.puff.tech.covertor.CustomerConvertor;
import com.puff.tech.repository.CustomerRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetSuppliersUseCase {

    private final KhataBookImplementation khataBookImplementation;
    private final CustomerRepository customerRepository;

    @Inject
    public GetSuppliersUseCase(KhataBookImplementation khataBookImplementation,
                           CustomerRepository customerRepository){
        this.khataBookImplementation=khataBookImplementation;
        this.customerRepository=customerRepository;
    }

    public Flux<GetAllCustomerUseCaseResponse> exeecute(){
        Integer khataBookId= khataBookImplementation.getCurrentKhataBookId().block();
        return  customerRepository.findByKhataBookIdAndSupplierOrderByCreatedAtDesc(khataBookId,true)
                .map(CustomerConvertor::toResponse)
                .onErrorResume(err->Flux.error(new Throwable("unexpected happened" +err.getLocalizedMessage())));
    }
}
