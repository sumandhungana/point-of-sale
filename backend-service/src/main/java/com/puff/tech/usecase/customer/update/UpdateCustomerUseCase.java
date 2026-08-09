package com.puff.tech.usecase.customer.update;

import com.puff.tech.covertor.CustomerConvertor;
import com.puff.tech.repository.CustomerRepository;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateCustomerUseCase  {

    private final CustomerRepository customerRepository;
    private final KhataBookImplementation khataBookImplementation;



    @Inject
    public UpdateCustomerUseCase(CustomerRepository customerRepository,
                                 KhataBookImplementation khataBookImplementation){
        this.customerRepository= customerRepository;
        this.khataBookImplementation=khataBookImplementation;
    }

    public Mono<UpdateCustomerUseCaseResponse> execute(UpdateCustomerUseCaseRequest request,Integer id) {
        Integer khataBookId= khataBookImplementation.getCurrentKhataBookId().block();
        return customerRepository.findByIdAndKhataBookId(id,khataBookId)
                .switchIfEmpty(Mono.error(new Throwable("User not found")))
                .flatMap(customerEntity -> {
                    CustomerConvertor.updateRequestToEntity(customerEntity,request);
                    return customerRepository.update(customerEntity);
                })
                .map(customerEntity -> new UpdateCustomerUseCaseResponse("Success", customerEntity.getId()))
                .onErrorResume(err->Mono.error(new Throwable("Unexpected happened" +err.getLocalizedMessage())));
    }
}
