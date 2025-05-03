import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { calendarApi } from '../../services/calendarApi';
import { RecipeDto } from '../../types/recipe';
import { FontAwesome } from '@expo/vector-icons';
import { recipeApi } from '../../services/recipeApi';

export default function HomeScreen() {
  const [upcomingMeals, setUpcomingMeals] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadUpcomingMeals();
    loadRecipes();
  }, []);

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

  const handleIngredientsSubmit = () => {
    // TODO: Implement ChatGPT integration
    console.log('Ingredients submitted:', ingredients);
  };

  const renderMealEvent = (mealEvent: any) => (
    <View style={styles.mealEventItem}>
      <Text style={styles.mealTime}>{mealEvent.hourMinString}</Text>
      <Text style={styles.recipeName}>{mealEvent.recipeName}</Text>
    </View>
  );

  const renderRecipeCard = ({ item }: { item: RecipeDto }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.recipeImage}
      />
      <Text style={styles.recipeCardName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
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
                  <View key={mealIndex} style={styles.mealEventItem}>
                    <Text style={styles.mealTime}>{meal.hourMinString}</Text>
                    <Text style={styles.recipeName}>{meal.recipeName}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recipe Suggestions</Text>
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
        <Text style={styles.sectionTitle}>Popular Recipes</Text>
        <View style={styles.recipesContainer}>
          <FlatList
            data={recipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity style={styles.plusButton}>
            <FontAwesome name="plus" size={24} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  mealTime: {
    fontSize: 14,
    fontWeight: '600',
    width: 50,
  },
  recipeName: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
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
  plusButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
}); 