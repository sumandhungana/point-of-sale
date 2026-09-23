package com.puff.tech.customermanagement.usecase.add;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.customermanagement.converter.CustomerConvertor;
import com.puff.tech.customermanagement.repository.CustomerRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class AddCustomerUseCase implements MonoUC<AddCustomerUseCaseRequest,AddCustomerUseCaseResponse> {

    private final CustomerRepository customerRepository;

    @Inject
    public AddCustomerUseCase(CustomerRepository customerRepository){
        this.customerRepository= customerRepository;
    }

    @Override
    public Mono<AddCustomerUseCaseResponse> execute(AddCustomerUseCaseRequest request, UseCaseContext context) {
        var customer= CustomerConvertor.toEntity(request, context.securityContext());
        return customerRepository.save(customer)
                .map(customerData -> AddCustomerUseCaseResponse.builder()
                        .message("Customer added successfully")
                        .id(customer.getId())
                        .build())
                .onErrorResume(err-> Mono.error(new Throwable("Unexpected happened while addinng customer" +err.getLocalizedMessage())));
    }

}
