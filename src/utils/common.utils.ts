export const setLocalStorageToken = (token: string): void => {
    localStorage.setItem(`${config.NAME_KEY}:token`, token);

}