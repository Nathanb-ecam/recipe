package com.example.recipe.service;

import com.example.recipe.dto.UserDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.entity.User;
import com.example.recipe.exception.NoContentException;
import com.example.recipe.exception.UserIsNotTheResourceOwnerException;
import com.example.recipe.mapper.UserMapper;
import com.example.recipe.repository.RecipeRepository;
import com.example.recipe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class UserService implements CrudService<UserDto>{


    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RecipeRepository recipeRepository;

    public String getCurrentUserId(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user.getId();  // Get the actual user ID
        }
        throw new RuntimeException("User not authenticated");
    }

    public void CheckUserAllowedToAccessResource(String resourceOwnerId) {
        /* TODO when RBAC is added, admins should be allowed to edit any resources */
        var currentUserId = getCurrentUserId();
         if(!resourceOwnerId.equals(currentUserId)) throw new UserIsNotTheResourceOwnerException("User is not allowed to modify this resource");

    }


/*    public UserDto updateOnePartiallyById(String id , UserDto userDto){
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isEmpty()) {
            throw new NoContentException("User not found");
        }

        User userToUpdate = existingUser.get();
        // Using reflection to update non-null fields from userDto to userToUpdate
        ReflectionUtils.updateNonNullFields(userDto, userToUpdate);

        var user =  userRepository.save(userToUpdate);
        return userMapper.toDto(user);
    }*/

    public UserDto updateRecipesIdsForUserWithId(String id, UserDto userDto) {
        /* TODO need to ensure that the user to modify is request by the user itself  */
        CheckUserAllowedToAccessResource(id);

        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isEmpty()) {
            throw new NoContentException("User not found");
        }

        User userToUpdate = existingUser.get();
        List<String> recipesIds = userDto.getRecipesIds();

        for (String recipeId : recipesIds) {
            Optional<Recipe> r = recipeRepository.findById(recipeId);
            if (r.isEmpty()) {
                log.error("One of the recipeId was not found");
                throw new NoContentException("One of the recipeId was not found");
            }
        }
        userToUpdate.setRecipesIds(recipesIds);

        var user =  userRepository.save(userToUpdate);
        return userMapper.toDto(user);
    }


    public UserDto updateGroceryForUserWithId(String id, UserDto userDto) {
        CheckUserAllowedToAccessResource(id);

        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isEmpty()) {
            throw new NoContentException("User not found");
        }
        User userToUpdate = existingUser.get();
        // Using reflection to update non-null fields from userDto to userToUpdate
        userToUpdate.setGrocery(userDto.getGrocery());

        var user =  userRepository.save(userToUpdate);
        return userMapper.toDto(user);
    }

    public UserDto getUserDetailed(){
        var currentUserId = getCurrentUserId();
        Optional<User> user = userRepository.findById(currentUserId);
        if (user.isEmpty()) {
            throw new NoContentException("User not found");
        }
        return userMapper.toDto(user.get());
    }

    @Override
    public List<UserDto> getAll() {
        List<UserDto> users =  userRepository
                .findAll()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
        if (users.isEmpty()) throw new NoContentException("No users found");
        return users;
    }

    @Override
    public UserDto getOneById(String id) {
        return userRepository
                .findById(id)
                .map(userMapper::toDto)
                .orElseThrow(() -> new NoContentException("User not found"))
                ;
    }

    @Override
    public UserDto updatePartiallyById(String id, UserDto updatedDto) {
        return null;
    }

    @Override
    public UserDto createOne(UserDto newDto) {
        String passwordHash = passwordEncoder.encode(newDto.getPassword());
        User user = userMapper.toEntity(newDto, passwordHash);
        userRepository.save(user);
        return newDto;
    }

    @Override
    public void deleteOneById(String id) {
        userRepository.deleteById(id);
    }
}

