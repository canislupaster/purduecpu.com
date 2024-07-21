export $(cat .deployenv | xargs)
cd client && npm run build && cd ..
./gradlew distZip
scp build/distributions/*.zip $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH
ssh -tt $REMOTE_USER@$REMOTE_HOST "
	sudo supervisorctl -c $SUPERVISOR_CONF stop $SUPERVISOR_NAME
	unzip -o $REMOTE_PATH/*.zip -d $REMOTE_PATH
	sudo supervisorctl -c $SUPERVISOR_CONF start $SUPERVISOR_NAME
"