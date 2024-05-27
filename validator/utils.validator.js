exports.isValidFirstName=(firstName)=> {
    return firstName.length >= 2 && firstName.length <= 50;
  };
  exports.isValidLastName=(lastName)=> {
    return lastName.length >= 1 && lastName.length <= 50;
  };
  
  exports.isValidUsername = (username) => {
    const validCharacters = /^[a-z0-9_.]*$/;
      return (
      validCharacters.test(username) &&
      username.length > 2
    );
  };
  exports.isValidEmail = (email) => {
    const regex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email) && email.length <= 100;
  };
  
  exports.isValidPassword = (password) => {
    const exp =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?!\s).{8,32}$/;
    return exp.test(password);
  };
  exports.normalizeEmail=(email)=>{
    return email?.trim().toLowerCase();
  }