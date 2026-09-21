package com.puff.tech.onboarding.usecase.user.update;

import com.puff.tech.covertor.UserConvertor;
import com.puff.tech.repository.UserRepository;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import reactor.core.publisher.Mono;


@Singleton
public class UpdateUserUseCase  {

    private final UserRepository userRepository;

    @Inject
    public UpdateUserUseCase(UserRepository userRepository){
        this.userRepository=userRepository;
    }

    public Mono<UpdateUserUseCaseResponse> execute(UpdateUserUseCaseRequest request,Integer id){
      return userRepository.findById(id)
              .switchIfEmpty(Mono.error(new Throwable("User not found")))
              .flatMap(userEntity -> {
                  UserConvertor.updateRequestToEntity(userEntity,request);
                  return userRepository.update(userEntity);
              })
              .map(updatedUser -> new UpdateUserUseCaseResponse("Updated successfully" ,updatedUser.getId()))
              .onErrorResume(err->Mono.error(new Throwable(err.getLocalizedMessage())));
    }
}
