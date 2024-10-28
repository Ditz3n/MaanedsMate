import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, useColorScheme, Alert, Keyboard, Platform, LayoutAnimation, UIManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import AddExpenseForm from '@/components/AddExpenseForm';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Index() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [expenses, setExpenses] = useState<{ id: string; title: string; price: number; description: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState<"add" | "view" | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<{ id: string; title: string; price: number; description: string } | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const colorScheme = useColorScheme();

  // Load expenses from AsyncStorage when the component mounts and whenever year or month changes
  useEffect(() => {
    loadExpenses();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [year, month]);

  // Function to handle alerts for both web and mobile platforms
  const showAlert = (title: string, message: string, buttons: { text: string; onPress?: () => void; style?: "cancel" | "default" | "destructive" }[]) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm(message);
      if (confirm) {
        const yesButton = buttons.find(button => button.text.toLowerCase() === 'ja' || button.text.toLowerCase() === 'ok');
        if (yesButton && yesButton.onPress) {
          yesButton.onPress();
        }
      } else {
        const noButton = buttons.find(button => button.text.toLowerCase() === 'nej' || button.text.toLowerCase() === 'cancel');
        if (noButton && noButton.onPress) {
          noButton.onPress();
        }
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  // Load expenses from AsyncStorage
  const loadExpenses = async () => {
    try {
      const data = await AsyncStorage.getItem(`${year}-${month}`);
      const parsedData = data ? JSON.parse(data) : [];
      setExpenses(parsedData);
      calculateTotal(parsedData);
    } catch (error) {
      console.error('Fejl ved at loade udgifter', error);
    }
  };

  // Calculate total for all expenses
  const calculateTotal = (expenses: { id: string; title: string; price: number; description: string }[]) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.price, 0);
    setTotal(totalAmount);
  };

  const handleAddExpense = (expense: { id: string; title: string; price: number | string; description: string }) => {
    const missingFields = [];
  
    // Check for missing fields and push them to the array
    if (!expense.title) {
      missingFields.push('TITEL');
    }
    if (expense.price === "" || expense.price == null) {
      missingFields.push('PRIS');
    }
    if (!expense.description) {
      missingFields.push('BESKRIVELSE');
    }
  
    // If there are any missing fields, alert the user
    if (missingFields.length > 0) {
      showAlert(
        'UGYLDIG INDTASTNING',
        `INDTAST VENLIGST:\n- ${missingFields.join('\n- ')}`,
        [{ text: 'OK' }]
      );
      return;
    }
  
    const parsedPrice = parseFloat(expense.price.toString());
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showAlert(
        'UGYLDIG INDTASTNING',
        'INDTAST VENLIGST EN POSITIV PRIS.',
        [{ text: 'OK' }]
      );
      return;
    }
  
    // Only proceed if all fields are valid
    const newExpense = { ...expense, price: parsedPrice };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpenses = [...expenses, newExpense];
    setExpenses(newExpenses);
    calculateTotal(newExpenses);
    AsyncStorage.setItem(`${year}-${month}`, JSON.stringify(newExpenses));
    setModalVisible(null); // Close modal only if expense is successfully added
  };
  

  
  // Select an expense and display it in the modal
  const handleSelectExpense = (expense: { id: string; title: string; price: number; description: string }) => {
    setSelectedExpense(expense);
    setIsAddingExpense(false);
    setModalVisible("view");
  };

  // Delete an expense with confirmation
  const handleDeleteExpense = () => {
    showAlert(
      'BEKRÆFT SLETNING',
      '\nER DU SIKKER PÅ, DU VIL SLETTE DENNE UDGIFT?',
      [
        { text: 'NEJ', style: 'cancel' },
        { text: 'JA', onPress: () => {
          if (selectedExpense) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            const newExpenses = expenses.filter(expense => expense.id !== selectedExpense.id);
            setExpenses(newExpenses);
            calculateTotal(newExpenses);
            AsyncStorage.setItem(`${year}-${month}`, JSON.stringify(newExpenses));
            setModalVisible(null);
          }
        }},
      ]
    );
  };

  // Open the modal to add a new expense
  const handleOpenAddExpenseModal = () => {
    setSelectedExpense(null);
    setIsAddingExpense(true);
    setModalVisible("add");
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    if (keyboardOpen) {
      Keyboard.dismiss();
    } else if (isAddingExpense) {
      showAlert(
        'ANNULER TILFØJELSE',
        '\nER DU SIKKER PÅ, AT DU VIL ANNULLERE TILFØJELSEN AF EN NY UDGIFT?',
        [
          { text: 'NEJ', style: 'cancel' },
          { text: 'JA', onPress: () => setModalVisible(null) },
        ]
      );
    } else {
      setModalVisible(null);
    }
  };

  // Map over årstal fra i år og 10 år tilbage
const yearOptions = [...Array(10)].map((_, i) => ({
  label: `${new Date().getFullYear() - i}`.toUpperCase(), // Transform label til uppercase
  value: new Date().getFullYear() - i,
}));

// Månederne i stedet for tal i pickeren
const monthOptions = [
  { label: 'Januar'.toUpperCase(), value: 1 }, // Transformer alle labels til uppercase
  { label: 'Februar'.toUpperCase(), value: 2 },
  { label: 'Marts'.toUpperCase(), value: 3 },
  { label: 'April'.toUpperCase(), value: 4 },
  { label: 'Maj'.toUpperCase(), value: 5 },
  { label: 'Juni'.toUpperCase(), value: 6 },
  { label: 'Juli'.toUpperCase(), value: 7 },
  { label: 'August'.toUpperCase(), value: 8 },
  { label: 'September'.toUpperCase(), value: 9 },
  { label: 'Oktober'.toUpperCase(), value: 10 },
  { label: 'November'.toUpperCase(), value: 11 },
  { label: 'December'.toUpperCase(), value: 12 },
];

  // Vælg farver alt efter om brugeren har valgt dark mode eller light mode på sin enhed
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;
  const pickerStyles = colorScheme === 'dark' ? darkPickerSelectStyles : lightPickerSelectStyles;

  // Selve applikationen
  return (
    <View style={styles.container}>
      {/* Header med år og måned pickere */}
      <View style={styles.header}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setYear(value)}
            items={yearOptions}
            style={pickerStyles}
            value={year}
            useNativeAndroidPickerStyle={false}
            placeholder={{ label: "VÆLG ET ÅRSTAL", value: null }}
          />
        </View>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setMonth(value)}
            items={monthOptions}
            style={pickerStyles}
            value={month}
            useNativeAndroidPickerStyle={false}
            placeholder={{ label: "VÆLG ET MÅNED", value: null }}
          />
        </View>
      </View>
      {/* Total udgifter */}
      <Text style={styles.totalText}>Total: {total} <Text style={styles.currencyText}>kr</Text></Text>
      {/* Liste over udgifter */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectExpense(item)} style={styles.expenseItem}>
            <Text style={styles.expenseText}>{item.title}: {item.price} <Text style={styles.currencyText}>kr</Text></Text>
          </TouchableOpacity>
        )}
      />
      {/* Knappen til at tilføje en ny udgift */}
      <TouchableOpacity style={styles.addButton} onPress={handleOpenAddExpenseModal}>
        <Text style={styles.addButtonText}>Tilføj Udgift</Text>
      </TouchableOpacity>
      {/* Modal til at tilføje eller vise en udgift */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible !== null}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalView}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, Platform.OS === 'web' && styles.modalContentWeb]}>
                {isAddingExpense ? (
                  <AddExpenseForm 
                    onAddExpense={handleAddExpense} 
                    onClose={() => setModalVisible(null)} 
                    onDeleteExpense={handleDeleteExpense} 
                    currentModal={modalVisible} 
                    setCurrentModal={setModalVisible} 
                  />
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
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteExpense}>
                          <Text style={styles.deleteButtonText}>FJERN UDGIFT</Text>
                        </TouchableOpacity>
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

// Styles til komponenten afhængigt af om brugeren har valgt light mode
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
    textTransform: 'uppercase',
  },
  expenseItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#222223',
    borderRadius: 5,
  },
  expenseText: {
    color: '#F2F3F4',
    textTransform: 'uppercase',
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
    textTransform: 'uppercase',
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
    alignItems: 'flex-start',
  },
  modalContentWeb: {
    maxWidth: 400,
    width: '100%',
  },
  titleText: {
    color: '#F2F3F4',
    fontSize: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  priceText: {
    color: '#F2F3F4',
    fontSize: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  descriptionText: {
    color: '#F2F3F4',
    fontSize: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  currencyText: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F3F4',
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonSpacer: {
    width: 10,
  },
  deleteButton: {
    backgroundColor: '#F2F3F4',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#222223',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});

// Styles til komponenten afhængigt af om brugeren har valgt dark mode
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
    textTransform: 'uppercase',
  },
  expenseItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#F2F3F4',
    borderRadius: 5,
  },
  expenseText: {
    color: '#222223',
    textTransform: 'uppercase',
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
    textTransform: 'uppercase',
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
    alignItems: 'flex-start',
  },
  modalContentWeb: {
    maxWidth: 400,
    width: '100%',
  },
  titleText: {
    color: '#222223',
    fontSize: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  priceText: {
    color: '#222223',
    fontSize: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  descriptionText: {
    color: '#222223',
    fontSize: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  currencyText: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  separator: {
    height: 1,
    backgroundColor: '#222223',
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonSpacer: {
    width: 10,
  },
  deleteButton: {
    backgroundColor: '#222223',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#F2F3F4',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});

// Styles til picker select alt efter om brugeren har valgt light mode
const lightPickerSelectStyles = StyleSheet.create({
  inputIOS: {
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
    textAlignVertical: 'center',
    textTransform: 'uppercase',
  },
  inputAndroid: {
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
    textAlignVertical: 'center',
    textTransform: 'uppercase',
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
    textTransform: 'uppercase',
  },
});

// styles til picker select alt efter om brugeren har valgt dark mode
const darkPickerSelectStyles = StyleSheet.create({
  inputIOS: {
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
    textAlignVertical: 'center',
    textTransform: 'uppercase',
  },
  inputAndroid: {
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
    textAlignVertical: 'center',
    textTransform: 'uppercase',
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
    textTransform: 'uppercase',
  },
});