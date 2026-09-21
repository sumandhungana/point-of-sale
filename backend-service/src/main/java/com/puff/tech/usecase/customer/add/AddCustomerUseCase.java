package com.puff.tech.usecase.customer.add;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.covertor.CustomerConvertor;
import com.puff.tech.repository.CustomerRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class AddCustomerUseCase implements UseCases<AddCustomerUseCaseRequest,AddCustomerUseCaseResponse> {

    private final CustomerRepository customerRepository;

    @Inject
    public AddCustomerUseCase(CustomerRepository customerRepository){
        this.customerRepository= customerRepository;
    }
    @Override
    public Mono<AddCustomerUseCaseResponse> execute(AddCustomerUseCaseRequest request) {
        var customer= CustomerConvertor.toEntity(request);
        return customerRepository.save(customer)
                .map(customerData->new AddCustomerUseCaseResponse("Customer added successfully", customer.getId()))
                .onErrorResume(err-> Mono.error(new Throwable("Unexpected happened while addinng customer" +err.getLocalizedMessage())));
    }
}
