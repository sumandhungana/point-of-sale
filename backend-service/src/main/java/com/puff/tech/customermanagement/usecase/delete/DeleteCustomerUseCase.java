package com.puff.tech.customermanagement.usecase.delete;

import com.puff.tech.core.usecases.MonoUC;
import com.puff.tech.customermanagement.repository.CustomerRepository;
import com.puff.tech.security.UseCaseContext;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteCustomerUseCase implements MonoUC<DeleteCustomerUseCaseRequest, DeleteCustomerUseCaseResponse> {

    private final CustomerRepository customerRepository;

    public DeleteCustomerUseCase(CustomerRepository customerRepository){
        this.customerRepository=customerRepository;
    }

    @Override
    public Mono<DeleteCustomerUseCaseResponse> execute(DeleteCustomerUseCaseRequest request, UseCaseContext context) {
        return customerRepository.findByIdAndMemberId(request.id(), context.securityContext().memberId())
                .switchIfEmpty(Mono.error(new Throwable("Customer not found")))
                .flatMap(customer->
                        customerRepository.deleteById(request.id())
                                .then(Mono.just(DeleteCustomerUseCaseResponse.builder()
                                                .message("Customer deleted successfully")
                                        .build()))
                                .onErrorResume(err->Mono.just(DeleteCustomerUseCaseResponse.builder()
                                                .message("Failed to delete customer: " +err.getLocalizedMessage())
                                        .build())));
    }

}
