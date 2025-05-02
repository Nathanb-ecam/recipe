import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { DailyMealPlan } from '../../types';
import { RecipeDto, MealType } from '../../types/recipe';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { RecipeSelectionModal } from '../../components/RecipeSelectionModal';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadMealPlan();
  }, [selectedDate]);

  const loadMealPlan = async () => {
    try {
      const data = await api.getMealPlan(selectedDate);
      setMealPlan(data);
    } catch (error: any) {
      // If it's a 404 error, that's expected when no meal plan exists
      if (error.message?.includes('404')) {
        setMealPlan({
          date: selectedDate,
          breakfast: '',
          lunch: '',
          dinner: '',
        });
      } else {
        console.error('Error loading meal plan:', error);
      }
    }
  };

  const handleRecipeSelect = async (recipe: RecipeDto) => {
    if (!selectedMealType || !mealPlan) return;

    const updatedMealPlan = {
      ...mealPlan,
      [selectedMealType.toLowerCase()]: recipe.id,
      [`${selectedMealType.toLowerCase()}Recipe`]: recipe,
    };

    try {
      await api.updateMealPlan(selectedDate, updatedMealPlan);
      setMealPlan(updatedMealPlan);
    } catch (error) {
      console.error('Error updating meal plan:', error);
    }
  };

  const renderMealInput = (mealType: keyof DailyMealPlan, label: string) => {
    const recipeId = mealPlan?.[mealType];
    const recipeName = mealPlan?.[`${mealType}RecipeName` as keyof DailyMealPlan];
    console.log('Rendering meal input:', { mealType, recipeId, recipeName });
    return (
      <View style={styles.mealInputContainer}>
        <Text style={styles.mealLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.mealInput}
          onPress={() => {
            setSelectedMealType(mealType.toUpperCase() as MealType);
            setModalVisible(true);
          }}
        >
          <Text style={styles.mealText}>
            {recipeName || (recipeId && recipeId !== '' ? 'Loading recipe...' : 'Select recipe')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#007AFF' },
        }}
      />
      <ScrollView style={styles.content}>
        {renderMealInput('breakfast', 'Breakfast')}
        {renderMealInput('lunch', 'Lunch')}
        {renderMealInput('dinner', 'Dinner')}
      </ScrollView>
      <RecipeSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleRecipeSelect}
        mealType={selectedMealType || 'BREAKFAST'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mealInputContainer: {
    marginBottom: 20,
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mealInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  mealText: {
    fontSize: 16,
    color: '#333',
  },
}); 