# sonore
> Digitial and synchronized stand app for orchestras and bands

## Project setup
- Install npm-packages
    ``` bash
    npm install
    ```
-  Create www-folder inside src-cordova
    ``` bash
    cd src-cordova
    mkdir www
    ```
-  Prepare Cordova-Project with platforms and plugins folder (inside src-cordova!) 
    ``` bash
    cordova prepare
    ```
-  Start the app as debug with connection to PC with hot-reloading (inside project root folder)
    ``` bash
    npm run cordova-serve-* (* = android/ios/browser)
    ```
  
## Tests 
- Run your tests
    ```
    npm run test
    ```

- Lints and fixes files
    ```
    npm run lint
    ```

- Run your end-to-end tests
    ```
    npm run test:e2e
    ```

- Run your unit tests
    ```
    npm run test:unit
    ```

## Deployment
```
npm run cordova-build-*
```
Then the webpack will be hosted on the device itself, but app needs signing.
- Android: [Sign your app manually from the command line](https://developer.android.com/studio/publish/app-signing#sign-manually)


## Cordova Setup
### Android
- Android SDK is required:
For install errors with missing ANDROID_HOME do:
```shell
export ANDROID_HOME=/path/to/Android/Sdk/
export PATH=${PATH}:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools
```
- JDK 1.8 is required.
For install errors with missing JAVA_HOME do:
```shell
export JAVA_HOME=/usr/lib/jvm/default
```
- Gradle is required 
- You need to install SDK27 to agree licence

### Windows (sketch)
- Install Visual Studio 2017 with Package "Mobile development with JavaScript"
- Open "Cordova-App"-Solution-File in platforms\windows with Visual Studio
- Try to run project (set specific architecture e.g. x53, do not use Any CPU!). This will just build the Sqlite Plugin
- Then try: ```cordova run windows --archs="x86"``` 
- If there are errors: 
  - You may need to set Environment Variable _MSBUILDDIR_ for example to: ```C:\Program Files (x86)\Microsoft Visual Studio\2017\Enterprise\MSBuild\15.0\Bin```
  - You may also need a specific Version of Windows SDK for UWP-Apps:
    - Therefore start a build and look for the error message, which will contain the required SDK tools version number. 
    - Go to the Visual Studio Installer and install SDK for C++ **and** UWP (C++ is required for Database).
- **TODO**: Start through Visual Studio (Problem: .jsproj not compatible) + **Debugging**

### iOS
Ask @lacinoire


## Additional Information
### Puli-Project 
Master Software-Engineering WS2018/19

### Contributors
- Tobias Beeh
- Carolin Brandt
- Franziska Geiger
- Marcel Henrich
- Martin Keppner

### Licence
...


