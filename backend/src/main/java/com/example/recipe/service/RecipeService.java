package com.example.recipe.service;

import com.example.recipe.dto.RecipeDto;
import com.example.recipe.dto.UserDto;
import com.example.recipe.entity.Recipe;
import com.example.recipe.entity.User;
import com.example.recipe.exception.DatabaseException;
import com.example.recipe.exception.GenericException;
import com.example.recipe.exception.NoContentException;
import com.example.recipe.exception.UserIsNotTheResourceOwnerException;
import com.example.recipe.mapper.RecipeMapper;
import com.example.recipe.repository.RecipeRepository;
import com.example.recipe.repository.UserRepository;
import com.example.recipe.utils.ReflectionUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeService implements CrudService<RecipeDto> {

    private final RecipeMapper recipeMapper;
    private final RecipeRepository recipeRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public void CheckIfRecipeBelongsToUser(String recipeId){
        /* TODO when RBAC is setup, an admin should be allowed to access any recipe */
        var currentUserId = userService.getCurrentUserId();
        Optional<Recipe> r = recipeRepository.findById(recipeId);
        if(r.isEmpty()) throw new NoContentException("There is no recipe with id " + recipeId);

        var tenantId = r.get().getTenantId();
        if(!tenantId.equals(currentUserId)) throw new UserIsNotTheResourceOwnerException("UserId doesnt match the resource tenantId");
    }

    public List<RecipeDto> fetchUsersRecipes(String userId){
        userService.CheckUserAllowedToAccessResource(userId);

        User user = userRepository.findById(userId).orElseThrow(() -> new UserIsNotTheResourceOwnerException("User doesn't exist"));
        List<String> recipesIds = user.getRecipesIds();

        return recipeRepository
                /* TODO return only the recipes if they are public or owned by the user */
                .findAllById(recipesIds)
                .stream()
                .map(recipeMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<RecipeDto> getAll() {
        try{
            List<RecipeDto> recipes =  recipeRepository
                    .findAllByIsPublicTrue()
                    .stream()
                    .map(recipeMapper::toDto)
                    .collect(Collectors.toList());
            if (recipes.isEmpty()) throw new NoContentException("There are no recipes");
            return recipes;
        }catch(DataAccessException e){
            throw new DatabaseException("Error accessing the database");
        }
        catch (Exception e){
            throw new GenericException(e.getMessage());
        }

    }

    public RecipeDto getOneById(String id) {
        var currentUserId = userService.getCurrentUserId();
        log.info("currentUserId");
        log.info(currentUserId);
        return recipeRepository
                .findByIdAndIsPublicTrue(id)
                .or(() -> recipeRepository.findByIdAndTenantId(id, currentUserId))
                .map(recipeMapper::toDto)
                .orElseThrow(() -> new UserIsNotTheResourceOwnerException("The recipe is private"))
                ;


    }

/*    public Recipe updateRecipe(String id, RecipeDto recipeDto){
        try{
            Optional<Recipe> existingRecipe = recipeRepository.findById(id);
            if (existingRecipe.isEmpty()) throw new NoContentException("Recipe not found");
            var updatedEntity = recipeMapper.toEntity(recipeDto);
            updatedEntity.setId(id);
            return recipeRepository.save(updatedEntity);
        }catch (DataAccessException e){
            throw new DatabaseException("Updating recipe resulted in a database error");
        }catch (Exception e){
            throw new GenericException(e.getMessage());
        }
    }*/

    public RecipeDto updatePartiallyById(String id, RecipeDto recipeDto) {
        CheckIfRecipeBelongsToUser(id);

        Optional<Recipe> existingRecipe = recipeRepository.findById(id);
        if (existingRecipe.isEmpty()) {
            throw new NoContentException("Recipe not found");
        }

        Recipe recipeToUpdate = existingRecipe.get();
        // Using reflection to update non-null fields from recipeDto to recipeToUpdate
        ReflectionUtils.updateNonNullFields(recipeDto, recipeToUpdate);

        var recipe =  recipeRepository.save(recipeToUpdate);
        return recipeMapper.toDto(recipe);
    }

    public RecipeDto createOne(RecipeDto recipeDto) {
        var recipeEntity = recipeMapper.toEntity(recipeDto);
        recipeEntity.setTenantId(userService.getCurrentUserId());
        var recipe = recipeRepository.save(recipeEntity);
        return recipeMapper.toDto(recipe);
    }

    public void deleteOneById(String id) {
        CheckIfRecipeBelongsToUser(id);
        recipeRepository.deleteById(id);
    }
}

