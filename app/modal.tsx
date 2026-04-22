import React from "react";
import { Image, Modal, StyleSheet, Text, View } from "react-native";
import GetStartedButton from "../components/GetStartedButton";

interface MyModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const MyModal: React.FC<MyModalProps> = ({ isVisible, onClose }) => {
  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Top Section for Logo and Text */}
          <View style={styles.topContent}>
            <Image
              source={require("../assets/images/heart.png")}
              style={styles.logo}
            />

            <Text style={styles.title}>
              <Text style={styles.resQ}>ResQ</Text>
              <Text style={styles.meals}>Meals</Text>
            </Text>

            <Text style={styles.description}>
              Reducing food waste by connecting events with those in need.
            </Text>
          </View>

          {/* Bottom Section for Button */}
          <View style={styles.buttonWrapper}>
            <GetStartedButton onPress={onClose} buttonText="Get Started" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    flex: 1, // Take up full screen
    backgroundColor: "white",
    paddingHorizontal: 25, // Side padding for the content
    paddingBottom: 40, // Space from the very bottom of the screen
  },
  topContent: {
    alignItems: "center", // Center logo and text horizontally
    marginTop: 100,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 40,
  },
  title: {
    fontSize: 35,
    fontWeight: "500",
    marginTop: 30,
    textAlign: "center",
  },
  resQ: {
    color: "#568056",
  },
  meals: {
    color: "#2ecc71",
  },
  description: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 30,
    lineHeight: 24, // Improves readability
  },
  buttonWrapper: {
    marginTop: "auto", // Pushes button to the bottom
    alignItems: "stretch", // Ensures the GetStartedButton expands to full width
    width: "100%",
  },
});

export default MyModal;
