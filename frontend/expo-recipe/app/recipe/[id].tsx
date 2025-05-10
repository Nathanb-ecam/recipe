import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { recipeApi } from '../../services/recipeApi';
import { RecipeDto } from '../../types/recipe';
import { FontAwesome } from '@expo/vector-icons';
import { api } from '@/services/api';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<RecipeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadRecipe();
    checkIfSaved(id as string);
  }, [id]);

  const loadRecipe = async () => {
    try {
      const data = await recipeApi.getRecipesFromIds([id as string]);
      if (data.length > 0) {
        setRecipe(data[0]);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async (recipeId: string) => {
    if(recipeId.length <= 1) return;
    const isSaved = await api.isRecipeIdSaved(recipeId);
    setIsSaved(isSaved);
  }
  
  const handleToggleSaveRecipe = async (recipeId: string) => {
    if(recipeId.length <= 1) return;
    if(!isSaved) {    
        try {
          await api.addRecipeIdToSavedRecipes(recipeId);
          setIsSaved(true);
        } catch (error) {
          console.error('Error adding recipeId to saved recipes:', error);
        }
    }else{
      try {
        await api.removeRecipeIdFromSaved(recipeId);
        setIsSaved(false);
      } catch (error) {
        console.error('Error removing recipeId from saved recipes:', error);
      }
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        
        <View style={styles.topImageContainer}>
          <Image
            source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/300' }}
            style={styles.image}
          />
          <TouchableOpacity
            style={styles.topRightCardAbsButton}
            onPress={() => handleToggleSaveRecipe(recipe.id)}
          >
              <FontAwesome name={isSaved ? 'heart' : 'heart-o'} size={16} color={isSaved ? '#FF3B30' : '#666'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{recipe.name}</Text>
          
          {recipe.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{recipe.description}</Text>
            </View>
          )}

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              {recipe.ingredients.map((ingredient, index) => (
                <Text key={index} style={styles.ingredient}>
                  • {ingredient.name} ({ingredient.amount.value} {ingredient.amount.unit})
                </Text>
              ))}
            </View>
          )}

          {recipe.steps && recipe.steps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Steps</Text>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.step}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <Text style={styles.stepText}>{step.instruction}</Text>
                </View>
              ))}
            </View>
          )}

          {recipe.duration && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Duration</Text>
              <Text style={styles.duration}>
                {recipe.duration.value} {recipe.duration.unit}
              </Text>
            </View>
          )}

          {recipe.mealTypes && recipe.mealTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meal Types</Text>
              <View style={styles.mealTypes}>
                {recipe.mealTypes.map((type, index) => (
                  <Text key={index} style={styles.mealType}>
                    {type}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  topImageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
  },
  topRightCardAbsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#FFD700',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  duration: {
    fontSize: 16,
    color: '#333',
  },
  mealTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mealType: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
}); 