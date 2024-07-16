export NODE_OPTIONS=--openssl-legacy-provider
copy_from=/wp4/war3dev/wc3data/build
android_assets=/work/DENV/AndroidStudioProjects/wc3dataAnServ/app/src/main/assets/www
javaapp_assets=/sn750/data-wc3hostAssets/www

forceCopy() {
    rm -rf "$android_assets"
    cp -R "$copy_from" "$android_assets"

    rm -rf "$javaapp_assets"
    cp -R "$copy_from" "$javaapp_assets"
}

npm run build && forceCopy
    
