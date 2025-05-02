import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../contexts/AuthContext';
import { calendarApi } from '../../services/calendarApi';
import { CalendarItem, MealEvent } from '../../types/calendar';
import { RecipeDto, MealType } from '../../types/recipe';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { RecipeSelectionModal } from '../../components/RecipeSelectionModal';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarItem, setCalendarItem] = useState<CalendarItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadMealPlan();
  }, [selectedDate]);

  const loadMealPlan = async () => {
    try {
      const data = await calendarApi.getMealPlan(selectedDate);
      setCalendarItem(data);
    } catch (error: any) {
      console.error('Error loading meal plan:', error);
    }
  };

  const handleAddMealEvent = async (recipe: RecipeDto, hourMinString: string) => {
    if (!calendarItem) return;

    const newMealEvent: MealEvent = {
      hourMinString,
      recipeId: recipe.id,
      recipeName: recipe.name,
    };

    const updatedMealEvents = [...calendarItem.mealEvents, newMealEvent];
    const updatedCalendarItem = {
      ...calendarItem,
      mealEvents: updatedMealEvents,
    };

    try {
      await calendarApi.updateMealPlan(selectedDate, {
        date: selectedDate,
        mealEvents: updatedMealEvents,
      });
      setCalendarItem(updatedCalendarItem);
    } catch (error) {
      console.error('Error updating meal plan:', error);
    }
  };

  const handleDeleteMealEvent = async (index: number) => {
    if (!calendarItem) return;

    const updatedMealEvents = [...calendarItem.mealEvents];
    updatedMealEvents.splice(index, 1);

    try {
      await calendarApi.updateMealPlan(selectedDate, {
        date: selectedDate,
        mealEvents: updatedMealEvents,
      });
      setCalendarItem({
        ...calendarItem,
        mealEvents: updatedMealEvents,
      });
    } catch (error) {
      console.error('Error deleting meal event:', error);
    }
  };

  const renderMealEvent = ({ item, index }: { item: MealEvent; index: number }) => (
    <View style={styles.mealEventContainer}>
      <Text style={styles.mealTime}>{item.hourMinString}</Text>
      <Text style={styles.recipeName}>{item.recipeName || 'Loading...'}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteMealEvent(index)}
      >
        <FontAwesome name="trash" size={16} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#FFD700' },
        }}
        theme={{
          todayTextColor: '#FFD700',
          arrowColor: '#FFD700',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: 'bold',
        }}
      />
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Meal Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <FontAwesome name="plus" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={calendarItem?.mealEvents || []}
          renderItem={renderMealEvent}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No meal events for this day</Text>
          }
        />
      </View>
      <RecipeSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleAddMealEvent}
        mealType="BREAKFAST"
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealEventContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  mealTime: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
  },
  recipeName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
}); 