export NODE_OPTIONS=--openssl-legacy-provider
npm run build && [ -d "/work/DENV/AndroidStudioProjects/wc3dataAnServ/app/src/main/assets/www/" ] &&
    rm -rf /work/DENV/AndroidStudioProjects/wc3dataAnServ/app/src/main/assets/www/ &&
    cp -R /wp4/war3dev/wc3data/build /work/DENV/AndroidStudioProjects/wc3dataAnServ/app/src/main/assets/www
