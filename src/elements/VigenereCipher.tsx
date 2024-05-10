class VigenereCipher {

  usernameKey = "HFUJADSJNMDKXOKHSBHSWDNMMDFLFLKKLSAMSN";
  passwordKey = "LELIWLNEQOKWJLEHGIWOJQKFLSUHNAKM";
  firstNameKey = "JKCNFLMJDSNXLMCXVBMGMJNKM";

  encode(data: string, purpose: string) {
    // const usernameKey: string = process.env.REACT_APP_USERNAME_VIGENERE_KEY!;
    // const passwordKey: string = process.env.REACT_APP_PASSWORD_VIGENERE_KEY!;
    // const firstNameKey: string = process.env.REACT_APP_FIRSTNAME_VIGENERE_KEY!; 

    let result = "";
    for (let i = 0; i < data.length; i++) {
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

  decode(data: string, purpose: string) {
    let result = "";
    for (let i = 0; i < data.length; i++) {
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