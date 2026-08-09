package com.puff.tech.usecase.customer.get;

import com.puff.tech.covertor.CustomerConvertor;
import com.puff.tech.repository.CustomerRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Singleton
public class GetAllCustomerUseCase {

    private final CustomerRepository customerRepository;
    private final KhataBookImplementation khataBookImplementation;

    @Inject
    public GetAllCustomerUseCase(CustomerRepository customerRepository,
                                 KhataBookImplementation khataBookImplementation){
        this.customerRepository=customerRepository;
        this.khataBookImplementation=khataBookImplementation;
    }

    public Flux<GetAllCustomerUseCaseResponse> execute(){
       Integer khataBookId= khataBookImplementation.getCurrentKhataBookId().block();
       return customerRepository.findByKhataBookIdAndSupplierOrderByCreatedAtDesc(khataBookId,false)
               .map(CustomerConvertor::toResponse)
               .onErrorResume(err-> Flux.error(new Throwable(err.getLocalizedMessage())));
    }


}
