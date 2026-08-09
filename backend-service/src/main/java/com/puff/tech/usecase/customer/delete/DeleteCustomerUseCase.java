package com.puff.tech.usecase.customer.delete;

import com.puff.tech.repository.CustomerRepository;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;

@Singleton
public class DeleteCustomerUseCase {

    private final CustomerRepository customerRepository;

    public DeleteCustomerUseCase(CustomerRepository customerRepository){
        this.customerRepository=customerRepository;
    }

    public Mono<DeleteCustomerUseCaseResponse> execute(Integer id){
       return  customerRepository.findById(id)
                .switchIfEmpty(Mono.error(new Throwable("User not found")))
               .flatMap(customerEntity -> customerRepository.deleteById(id)
                       .then(Mono.just(new DeleteCustomerUseCaseResponse("Customer deleted successfully"))))
               .onErrorResume(err->Mono.error(new Throwable("Unexpected happened" +err.getLocalizedMessage())));
    }
}
