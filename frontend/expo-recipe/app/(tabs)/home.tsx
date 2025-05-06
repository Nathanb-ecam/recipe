import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, Image, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { calendarApi } from '../../services/calendarApi';
import { RecipeDto } from '../../types/recipe';
import { FontAwesome } from '@expo/vector-icons';
import { recipeApi } from '../../services/recipeApi';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [upcomingMeals, setUpcomingMeals] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const { user } = useAuth();

  const loadUpcomingMeals = async () => {
    try {
      const today = new Date();
      const meals = [];
      
      for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const mealPlan = await calendarApi.getMealPlan(dateString);
        meals.push({
          date: dateString,
          meals: mealPlan.mealEvents
        });
      }
      
      setUpcomingMeals(meals);
    } catch (error) {
      console.error('Error loading upcoming meals:', error);
    }
  };

  const loadRecipes = async () => {
    try {
      const data = await recipeApi.getCompactRecipes();
      setRecipes(data.slice(0, 3));
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  // Load data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUpcomingMeals();
      loadRecipes();
    }, [])
  );

  const handleIngredientsSubmit = () => {
    // TODO: Implement ChatGPT integration
    console.log('Ingredients submitted:', ingredients);
  };

  const handleRecipePress = (recipe: RecipeDto) => {
    router.push(`/recipe/${recipe.id}`);
  };

  const handleMealPress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const renderMealEvent = (mealEvent: any) => {
    const hour = parseInt(mealEvent.hourMinString.split(':')[0]);
    let lineColor = '#000';
    
    if (hour < 12) {
      lineColor = '#007AFF'; // blue
    } else if (hour < 15) {
      lineColor = '#FF9500'; // orange
    } else if (hour < 17) {
      lineColor = '#34C759'; // green
    } else {
      lineColor = '#8B4513'; // brown
    }

    return (
      <View style={styles.mealEventItem}>
        <View style={[styles.verticalLine, { backgroundColor: lineColor }]} />
        <View style={styles.mealEventContent}>
          <Text style={styles.mealTime}>{mealEvent.hourMinString}</Text>
          <Text style={styles.recipeName}>{mealEvent.recipeName}</Text>
        </View>
      </View>
    );
  };

  const renderRecipeCard = ({ item }: { item: RecipeDto }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.recipeImage}
      />
      <Text style={styles.recipeCardName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Recipe</Text>
          <View style={styles.createRecipeButtons}>
            <TouchableOpacity 
              style={styles.createRecipeButton}
              onPress={() => router.push('/recipe/new')}
            >
              <FontAwesome name="plus-circle" size={18} color="#000" />
              <Text style={styles.createRecipeText}>Create your own</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createRecipeButton}
              onPress={() => router.push('/recipe/new?source=image')}
            >
              <FontAwesome name="camera" size={18} color="#000" />
              <Text style={styles.createRecipeText}>Create from image</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createRecipeButton}
              onPress={() => router.push('/recipe/new?source=link')}
            >
              <FontAwesome name="link" size={18} color="#000" />
              <Text style={styles.createRecipeText}>Create from link</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Find ideas</Text>
          <View style={styles.ingredientsInputContainer}>
            <TextInput
              style={styles.ingredientsInput}
              placeholder="Enter ingredients (comma separated)"
              value={ingredients}
              onChangeText={setIngredients}
              multiline
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleIngredientsSubmit}
            >
              <Text style={styles.submitButtonText}>Get Suggestions</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Meals</Text>
          <View style={styles.daysContainer}>
            {upcomingMeals.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text style={styles.dayTitle}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <View style={styles.mealEventsContainer}>
                  {day.meals?.map((meal: any, mealIndex: number) => (
                    <TouchableOpacity
                      key={mealIndex}
                      onPress={() => handleMealPress(meal.recipeId)}
                    >
                      {renderMealEvent(meal)}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Recipes</Text>
          <View style={styles.recipesContainer}>
            <FlatList
              data={recipes}
              renderItem={renderRecipeCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
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
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  mealEventsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 8,
  },
  mealEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  verticalLine: {
    width: 4,
    height: '100%',
    marginRight: 8,
    borderRadius: 2,
  },
  mealEventContent: {
    flex: 1,
  },
  mealTime: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeName: {
    fontSize: 12,
    color: '#666',
  },
  ingredientsInputContainer: {
    marginBottom: 16,
  },
  ingredientsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  recipesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeCard: {
    width: 150,
    height: 150,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  recipeImage: {
    width: '100%',
    height: 100,
  },
  recipeCardName: {
    padding: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  createRecipeButtons: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
  },
  createRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    width: '100%',
    gap: 8,
  },
  createRecipeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
}); 