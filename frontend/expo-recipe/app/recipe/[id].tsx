import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, Tabs } from 'expo-router';
import { recipeApi } from '../../services/recipeApi';
import { RecipeDto } from '../../types/recipe';
import { FontAwesome } from '@expo/vector-icons';
import { api } from '@/services/api';
import { API_ASSET_URL } from '@/services/config';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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
        router.setParams({ title: data[0].name });
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  // console.log(recipe);

  return (
    <>

      <Tabs.Screen options={{
        title: `${recipe.name}`,        
      }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          
          <View style={styles.topImageContainer}>
            <Image
              source={{ uri: API_ASSET_URL + recipe.imageUrl || 'https://via.placeholder.com/300' }}
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
                        
              <View style={styles.header}>
                  <Text style={styles.title}>{recipe.name}</Text>
                  <View style={styles.headerRightSection}>
                    <Text>{recipe.relativePrice}</Text>
                    <Text style={styles.duration}>{recipe.cookTimeMin}min</Text>
                    <Text style={styles.duration}>{recipe.prepTimeMin}min</Text>
                  </View>
              </View>
                        
      
            {recipe.description && (
              <Text style={styles.dscription}>{recipe.description}</Text>
            )}
    

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                {recipe.ingredients.map(({name, amount}, index) => (
                  <Text key={index} style={styles.ingredient}>
                    • {name} {amount?.value} {amount?.unit}
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
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}


            {recipe.mealTypes && recipe.mealTypes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Repas</Text>
                <View style={styles.mealTypes}>
                  {recipe.mealTypes.map((type, index) => (
                    <Text key={index} style={styles.mealType}>
                      {type}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            {recipe.foodOrigins && recipe.foodOrigins.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Types de cuisine</Text>
                <View style={styles.foodOrigins}>
                  {recipe.foodOrigins.map((type, index) => (
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
    </>
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
    width:  34,
    height: 34,
    borderRadius: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRightSection: {
    flexDirection: 'row',
    gap: 16,
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
    marginBottom: 16,
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
    fontSize: 12,
    fontWeight: '400',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f8f8f8',
    color: '#666',
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

  foodOrigins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
}); 