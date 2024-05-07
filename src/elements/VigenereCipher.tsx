class VigenereCipher {

  // usernameKey = "HFUJADSJNMDKXOKHSBHSWDNMMDFLFLKKLSAMSN";
  // passwordKey = "LELIWLNEQOKWJLEHGIWOJQKFLSUHNAKM";
  // firstNameKey = "JKCNFLMJDSNXLMCXVBMGMJNKM";

  encode(data: string, purpose: string) {
    const usernameKey: string = process.env.REACT_APP_USERNAME_VIGENERE_KEY!;
    const passwordKey: string = process.env.REACT_APP_PASSWORD_VIGENERE_KEY!;
    const firstNameKey: string = process.env.REACT_APP_FIRSTNAME_VIGENERE_KEY!; 

    console.log(usernameKey);
    console.log(passwordKey);
    console.log(firstNameKey);

    let result = "";
    for (let i = 0; i < data.length; i++) {
      if (purpose === "username") {
        result += String.fromCharCode(data.charCodeAt(i) + usernameKey.charCodeAt(i % usernameKey.length));
      } else if (purpose === "password") {
        result += String.fromCharCode(data.charCodeAt(i) + passwordKey.charCodeAt(i % passwordKey.length));
      } else {
        result += String.fromCharCode(data.charCodeAt(i) + firstNameKey.charCodeAt(i & firstNameKey.length));
      }
    }
    return result;
  }
}

export default VigenereCipher;