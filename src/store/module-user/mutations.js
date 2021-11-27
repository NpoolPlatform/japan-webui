export function updateUserInfo(state, user) {
  state.user = user;
}

export function updateUserLoginVerify(state, val) {
  state.user.info.UserAppInfo.UserApplicationInfo.GALogin = val;
}

export function updateFirstname(state, val) {
  state.user.info.UserBasicInfo.FirstName = val;
}

export function updateLastname(state, val) {
  state.user.info.UserBasicInfo.LastName = val;
}

export function updateStreet1(state, val) {
  state.user.info.UserBasicInfo.StreetAddress1 = val;
}

export function updateStreet2(state, val) {
  state.user.info.UserBasicInfo.StreetAddress2 = val;
}

export function updateCity(state, val) {
  state.user.info.UserBasicInfo.City = val;
}

export function updateProvince(state, val) {
  state.user.info.UserBasicInfo.Province = val;
}

export function updateCountry(state, val) {
  state.user.info.UserBasicInfo.Country = val;
}

export function updateGA(state, val) {
  state.user.info.UserAppInfo.UserApplicationInfo.GAVerify = val;
}