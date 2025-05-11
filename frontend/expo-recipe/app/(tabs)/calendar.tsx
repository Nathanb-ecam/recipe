import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Platform, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../contexts/AuthContext';
import { calendarApi } from '../../services/calendarApi';
import { CalendarItem, MealEvent } from '../../types/calendar';
import { RecipeDto, MealType } from '../../types/recipe';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { RecipeSelectionModal } from '../../components/RecipeSelectionModal';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MEAL_TYPES } from '../../types/constants';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarItem, setCalendarItem] = useState<CalendarItem>({
    id: '',
    date: '',
    mealEvents: [],
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const { user } = useAuth();
  const [selectedMealType, setSelectedMealType] = useState<MealType>('LUNCH');
  const router = useRouter();

  useEffect(() => {
    loadMealPlan();
    loadRecipes();
  }, [selectedDate]);

  const loadRecipes = async () => {
    try {
      const data = await api.getLatestRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
  };

  const loadMealPlan = async () => {
    try {
      setLoading(true);
      const data = await calendarApi.getMealPlan(selectedDate);
      console.log('Fetched meal plan:', JSON.stringify(data, null, 2));
      
      // Ensure mealEvents is an array and has recipe names
      const mealEvents = (data.mealEvents || []).map(event => ({
        ...event,
        recipeName: event.recipeName || 'No recipe selected'
      }));

      setCalendarItem({
        id: data.id || '',
        date: selectedDate,
        mealEvents,
      });
    } catch (error: any) {
      console.error('Error loading meal plan:', error);
      setCalendarItem({
        id: '',
        date: selectedDate,
        mealEvents: [],
      });
    } finally {
      setLoading(false);
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
    // Sort mealEvents by hourMinString ("HH:mm")
    updatedMealEvents.sort((a, b) => a.hourMinString.localeCompare(b.hourMinString));

    const updatedCalendarItem = {
      ...calendarItem,
      mealEvents: updatedMealEvents,
    };

    try {
      await calendarApi.updateMealPlan({
        date: selectedDate,
        mealEvents: updatedMealEvents,
      });
      setCalendarItem(updatedCalendarItem);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating meal plan:', error);
    }
  };

  const handleDeleteMealEvent = async (event: MealEvent) => {
    if (!calendarItem) return;

    const updatedMealEvents = [...calendarItem.mealEvents];
    updatedMealEvents.splice(updatedMealEvents.indexOf(event), 1);

    try {
      await calendarApi.updateMealPlan({
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

  const getMealEventColor = (hourMinString: string) => {
    const [hours, minutes] = hourMinString.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    if (timeInMinutes < 12 * 60) { // Before noon
      return '#FFD700'; // Yellow for breakfast
    } else if (timeInMinutes < 15 * 60) { // Before 3 PM
      return '#FFA500'; // Orange for lunch
    } else {
      return '#FF6347'; // Red for dinner
    }
  };

  const getMealEventTitle = (hourMinString: string) => {
    const [hours, minutes] = hourMinString.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    if (timeInMinutes < 12 * 60) {
      return 'Breakfast';
    } else if (timeInMinutes < 15 * 60) {
      return 'Lunch';
    } else {
      return 'Dinner';
    }
  };

  const renderMealEvent = (mealEvent: MealEvent) => {
    const color = getMealEventColor(mealEvent.hourMinString);
    const title = getMealEventTitle(mealEvent.hourMinString);
    
    return (
      <View style={styles.mealEventContainer}>
        {/* <Text style={styles.mealEventTitle}>{title}</Text> */}
        <TouchableOpacity
          style={styles.mealEvent}
          onPress={() => router.push(`/recipe/${mealEvent.recipeId}`)}
        >
          <View style={[styles.mealEventColorLine, { backgroundColor: color }]} />
          <View style={styles.mealEventContent}>
            <Text style={styles.mealTime}>{mealEvent.hourMinString}</Text>
            <Text style={styles.mealName}>{mealEvent.recipeName}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMealEvent(mealEvent)}
          >
            <FontAwesome name="times" size={24} color="#999" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAddButton = () => (
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => router.push('/meal-event/new')}
    >
      <FontAwesome name="plus" size={24} color="#FFD700" />
    </TouchableOpacity>
  );

  const RecipeSelectionModal = () => {
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [selectedMealType, setSelectedMealType] = useState<MealType>('BREAKFAST');
    const [searchText, setSearchText] = useState('');

    const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
      if (date) {
        setSelectedTime(date);
      }
    };

    const handleConfirm = () => {
      const hourMinString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
      const selectedRecipe = recipes.find(r => r.mealTypes?.includes(selectedMealType));
      if (selectedRecipe) {
        handleAddMealEvent(selectedRecipe, hourMinString);
      }
      setModalVisible(false);
    };

    const filteredRecipes = recipes.filter(recipe => 
      recipe.mealTypes?.includes(selectedMealType) &&
      recipe.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Meal Event</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
              />
            </View>

            <View style={styles.mealTypeTabs}>
              {['BREAKFAST', 'LUNCH', 'DINNER'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeTab,
                    selectedMealType === type && styles.selectedMealTypeTab
                  ]}
                  onPress={() => setSelectedMealType(type as MealType)}
                >
                  <Text style={[
                    styles.mealTypeTabText,
                    selectedMealType === type && styles.selectedMealTypeTabText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              value={searchText}
              onChangeText={setSearchText}
            />

            <FlatList
              data={filteredRecipes}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recipeItem}
                  onPress={() => {
                    const hourMinString = `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}`;
                    handleAddMealEvent(item, hourMinString);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.recipeItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={{ height: 10 }} />

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

        <View style={{ height: 10 }} />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Meal Events</Text>
            {renderAddButton()}
          </View>
          <FlatList
            data={calendarItem?.mealEvents || []}
            renderItem={({ item }) => renderMealEvent(item)}
            keyExtractor={(item) => item.recipeId}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No meal events for this day</Text>
            }
          />
        </View>
        <RecipeSelectionModal />
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',    
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width:  36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  mealEventContainer: {
    marginBottom: 8,
  },
  mealEventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  mealEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  mealEventColorLine: {
    width: 4,
    height: '100%',
  },
  mealEventContent: {
    flex: 1,
    padding: 12,
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
    marginRight: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timePickerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  mealTypeTabs: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  mealTypeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  selectedMealTypeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  mealTypeTabText: {
    fontSize: 16,
    color: '#666',
  },
  selectedMealTypeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
  },
  recipeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  recipeItemText: {
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
}); 