package com.puff.tech.customermanagement.usecase.update;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.customermanagement.converter.CustomerConvertor;
import com.puff.tech.customermanagement.repository.CustomerRepository;
import com.puff.tech.security.UseCaseContext;
import com.puff.tech.service.implementation.KhataBookImplementation;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class UpdateCustomerUseCase implements MonoUC<UpdateCustomerUseCaseRequest, UpdateCustomerUseCaseResponse> {

    private final CustomerRepository customerRepository;




    @Inject
    public UpdateCustomerUseCase(CustomerRepository customerRepository) {
        this.customerRepository= customerRepository;
    }

    @Override
    public Mono<UpdateCustomerUseCaseResponse> execute(UpdateCustomerUseCaseRequest request, UseCaseContext context) {
        return customerRepository.findByIdAndMemberId(request.customerId(), context.securityContext().memberId())
                .switchIfEmpty(Mono.error(new Throwable("Customer not found")))
                .flatMap(customer->{
                  var newCustomer= CustomerConvertor.updateRequestToEntity(customer, request);
                  newCustomer.setUpdatedBy("SYSTEM");
                  return customerRepository.update(newCustomer)
                          .map(customerData-> UpdateCustomerUseCaseResponse.builder()
                                  .message("Customer updated successfully")
                                  .id(customer.getId())
                                  .build())
                          .onErrorResume(err->Mono.just(new UpdateCustomerUseCaseResponse("User failed to update: " +err.getLocalizedMessage(), null) ));
                });
    }
}
