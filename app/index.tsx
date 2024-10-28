import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, useColorScheme, Button } from 'react-native';
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

  const colorScheme = useColorScheme();

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

  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;
  const pickerStyles = colorScheme === 'dark' ? darkPickerSelectStyles : lightPickerSelectStyles;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setYear(value)}
            items={yearOptions}
            style={pickerStyles}
            value={year}
            useNativeAndroidPickerStyle={false}
            placeholder={{ label: "Vælg et årstal", value: null }}
          />
        </View>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setMonth(value)}
            items={monthOptions}
            style={pickerStyles}
            value={month}
            useNativeAndroidPickerStyle={false}
            placeholder={{ label: "Vælg et måned", value: null }}
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
      <TouchableOpacity style={styles.addButton} onPress={handleOpenAddExpenseModal}>
        <Text style={styles.addButtonText}>Tilføj Udgift</Text>
      </TouchableOpacity>
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
                        <Button title="Delete" onPress={handleDeleteExpense} color={colorScheme === 'dark' ? '#222223' : '#F2F3F4'} />
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

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F3F4',
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
    color: '#222223',
    marginBottom: 16,
  },
  expenseItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#222223',
    borderRadius: 5,
  },
  expenseText: {
    color: '#F2F3F4',
  },
  addButton: {
    backgroundColor: '#222223',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  addButtonText: {
    color: '#F2F3F4',
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#222223',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start', // Align items to the left
  },
  titleText: {
    color: '#F2F3F4',
    fontSize: 24, // Largest font size for title
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  priceText: {
    color: '#F2F3F4',
    fontSize: 20, // Smaller font size for price
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  descriptionText: {
    color: '#F2F3F4',
    fontSize: 16, // Smallest font size for description
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  currencyText: {
    fontSize: 14, // Smaller font size for currency
    opacity: 0.7, // Make the currency text a bit transparent
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F3F4',
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

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#222223',
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
    color: '#F2F3F4',
    marginBottom: 16,
  },
  expenseItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#F2F3F4',
    borderRadius: 5,
  },
  expenseText: {
    color: '#222223',
  },
  addButton: {
    backgroundColor: '#F2F3F4',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  addButtonText: {
    color: '#222223',
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#F2F3F4',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start', // Align items to the left
  },
  titleText: {
    color: '#222223',
    fontSize: 24, // Largest font size for title
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  priceText: {
    color: '#222223',
    fontSize: 20, // Smaller font size for price
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  descriptionText: {
    color: '#222223',
    fontSize: 16, // Smallest font size for description
    marginBottom: 10, // Adjust this to change the space between the text and the separator
  },
  currencyText: {
    fontSize: 14, // Smaller font size for currency
    opacity: 0.7, // Make the currency text a bit transparent
  },
  separator: {
    height: 1,
    backgroundColor: '#222223',
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

const lightPickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0, // Remove horizontal padding
    borderWidth: 1,
    borderColor: '#222223',
    borderRadius: 4,
    color: '#F2F3F4',
    paddingRight: 0, // Remove right padding
    backgroundColor: '#222223',
    textAlign: 'center', // Center the text horizontally
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0, // Remove horizontal padding
    borderWidth: 1,
    borderColor: '#222223',
    borderRadius: 4,
    color: '#F2F3F4',
    paddingRight: 0, // Remove right padding
    backgroundColor: '#222223',
    textAlign: 'center', // Center the text horizontally
    textAlignVertical: 'center', // Center the text vertically
  },
  inputWeb: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#222223',
    borderRadius: 4,
    color: '#F2F3F4',
    paddingRight: 0,
    backgroundColor: '#222223',
    textAlign: 'center',
  },
});

const darkPickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0, // Remove horizontal padding
    borderWidth: 1,
    borderColor: '#F2F3F4',
    borderRadius: 4,
    color: '#222223',
    paddingRight: 0, // Remove right padding
    backgroundColor: '#F2F3F4',
    textAlign: 'center', // Center the text horizontally
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0, // Remove horizontal padding
    borderWidth: 1,
    borderColor: '#222223',
    borderRadius: 4,
    color: '#F2F3F4',
    paddingRight: 0, // Remove right padding
    backgroundColor: '#222223',
    textAlign: 'center', // Center the text horizontally
    textAlignVertical: 'center', // Center the text vertically
  },
  inputWeb: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#F2F3F4',
    borderRadius: 4,
    color: '#222223',
    paddingRight: 0,
    backgroundColor: '#F2F3F4',
    textAlign: 'center',
  },
});