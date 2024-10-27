import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import AddExpenseForm from '@/components/AddExpenseForm';

export default function Index() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [expenses, setExpenses] = useState<{ id: string; title: string; price: number; description: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{ id: string; title: string; price: number; description: string } | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [year, month]);

  const loadExpenses = async () => {
    try {
      const data = await AsyncStorage.getItem(`${year}-${month}`);
      const parsedData = data ? JSON.parse(data) : [];
      setExpenses(parsedData);
      calculateTotal(parsedData);
    } catch (error) {
      console.error('Failed to load expenses', error);
    }
  };

  const calculateTotal = (expenses: { id: string; title: string; price: number; description: string }[]) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.price, 0);
    setTotal(totalAmount);
  };

  const handleAddExpense = (expense: { id: string; title: string; price: number; description: string }) => {
    const newExpenses = [...expenses, expense];
    setExpenses(newExpenses);
    calculateTotal(newExpenses);
    AsyncStorage.setItem(`${year}-${month}`, JSON.stringify(newExpenses));
  };

  const handleSelectExpense = (expense: { id: string; title: string; price: number; description: string }) => {
    setSelectedExpense(expense);
    setIsAddingExpense(false);
    setModalVisible(true);
  };

  const handleDeleteExpense = () => {
    if (selectedExpense) {
      const newExpenses = expenses.filter(expense => expense.id !== selectedExpense.id);
      setExpenses(newExpenses);
      calculateTotal(newExpenses);
      AsyncStorage.setItem(`${year}-${month}`, JSON.stringify(newExpenses));
      setModalVisible(false);
    }
  };

  const handleOpenAddExpenseModal = () => {
    setSelectedExpense(null);
    setIsAddingExpense(true);
    setModalVisible(true);
  };

  const yearOptions = [...Array(10)].map((_, i) => ({
    label: `${new Date().getFullYear() - i}`,
    value: new Date().getFullYear() - i,
  }));

  const monthOptions = [...Array(12)].map((_, i) => ({
    label: `${i + 1}`,
    value: i + 1,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setYear(value)}
            items={yearOptions}
            style={pickerSelectStyles}
            value={year}
            useNativeAndroidPickerStyle={false}
          />
        </View>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setMonth(value)}
            items={monthOptions}
            style={pickerSelectStyles}
            value={month}
            useNativeAndroidPickerStyle={false}
          />
        </View>
      </View>
      <Text style={styles.totalText}>Total: {total} <Text style={styles.currencyText}>kr</Text></Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectExpense(item)} style={styles.expenseItem}>
            <Text style={styles.expenseText}>{item.title}: {item.price} <Text style={styles.currencyText}>kr</Text></Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Tilføj Udgift" onPress={handleOpenAddExpenseModal} color="#242423" />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {isAddingExpense ? (
                  <AddExpenseForm onAddExpense={handleAddExpense} onClose={() => setModalVisible(false)} />
                ) : (
                  selectedExpense && (
                    <>
                      <Text style={styles.titleText}>{selectedExpense.title}</Text>
                      <View style={styles.separator} />
                      <Text style={styles.priceText}>{selectedExpense.price} <Text style={styles.currencyText}>kr</Text></Text>
                      <View style={styles.separator} />
                      <Text style={styles.descriptionText}>{selectedExpense.description}</Text>
                      <View style={styles.separator} />
                      <View style={styles.buttonContainer}>
                        <Button title="Delete" onPress={handleDeleteExpense} color="#F5CB5C" />
                      </View>
                    </>
                  )
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E8EDDF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242423',
    marginBottom: 16,
  },
  expenseItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#333533',
    borderRadius: 5,
  },
  expenseText: {
    color: '#E8EDDF',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#333533',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start', // Align items to the left
  },
  titleText: {
    color: '#E8EDDF',
    fontSize: 24, // Largest font size for title
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  priceText: {
    color: '#E8EDDF',
    fontSize: 20, // Smaller font size for price
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  descriptionText: {
    color: '#E8EDDF',
    fontSize: 16, // Smallest font size for description
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  currencyText: {
    fontSize: 14, // Smaller font size for currency
    opacity: 0.7, // Make the currency text a bit transparent
  },
  separator: {
    height: 1,
    backgroundColor: '#E8EDDF',
    alignSelf: 'stretch',
    marginVertical: 10, // Adjust this to change the distance between the text and the underline
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the button
    width: '100%',
    marginTop: 10,
  },
  buttonSpacer: {
    width: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0, // Remove horizontal padding
    borderWidth: 1,
    borderColor: '#CFDBD5',
    borderRadius: 4,
    color: '#242423',
    paddingRight: 0, // Remove right padding
    backgroundColor: '#CFDBD5',
    textAlign: 'center', // Center the text horizontally
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0, // Remove horizontal padding
    borderWidth: 1,
    borderColor: '#CFDBD5',
    borderRadius: 4,
    color: '#242423',
    paddingRight: 0, // Remove right padding
    backgroundColor: '#CFDBD5',
    textAlign: 'center', // Center the text horizontally
    textAlignVertical: 'center', // Center the text vertically
  },
});