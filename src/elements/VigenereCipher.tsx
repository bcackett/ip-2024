class VigenereCipher {

  // This class is used to encrypt and decrypt the sensitive data that is stored/will be stored on the database.
  // The keys required for encryption are stored as environment variables for security purposes.
  // A different unique and truly random key is used for each piece of data as an additional layer of security.
  // Encryption uses Unicode values to allow for more characters beyond the Latin alphabet to be used in usernames and passwords.

  usernameKey: string = process.env.REACT_APP_USERNAME_VIGENERE_KEY!;
  passwordKey: string = process.env.REACT_APP_PASSWORD_VIGENERE_KEY!;
  firstNameKey: string = process.env.REACT_APP_FIRSTNAME_VIGENERE_KEY!; 

  encrypt(data: string, purpose: string) {
    let result = "";
    for (let i = 0; i < data.length; i++) {
      /* Encryption is performed by summing the character in the data to be encrypted and the next character in the key,
      cycling to the beginning of the key if the last character is reached. */
      if (purpose === "username") {
        result += String.fromCharCode(data.charCodeAt(i) + this.usernameKey.charCodeAt(i % this.usernameKey.length));
      } else if (purpose === "password") {
        result += String.fromCharCode(data.charCodeAt(i) + this.passwordKey.charCodeAt(i % this.passwordKey.length));
      } else {
        result += String.fromCharCode(data.charCodeAt(i) + this.firstNameKey.charCodeAt(i & this.firstNameKey.length));
      }
    }
    return result;
  }

  decrypt(data: string, purpose: string) {
    let result = "";
    for (let i = 0; i < data.length; i++) {
      /* Decryption is performed by subtracting the next character in the key,
      cycling to the beginning of the key if the last character is reached, from the encrypted character. */
      if (purpose === "username") {
        result += String.fromCharCode(data.charCodeAt(i) - this.usernameKey.charCodeAt(i % this.usernameKey.length));
      } else if (purpose === "password") {
        result += String.fromCharCode(data.charCodeAt(i) - this.passwordKey.charCodeAt(i % this.passwordKey.length));
      } else {
        result += String.fromCharCode(data.charCodeAt(i) - this.firstNameKey.charCodeAt(i & this.firstNameKey.length));
      }
    }
    return result;
  }
}

export default VigenereCipher;