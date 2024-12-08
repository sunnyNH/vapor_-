CUR_DIR = $(CURDIR)

# =====================================================================
# 	run
# =====================================================================
run:
	git pull
	swift build
	lsof -i :8080 -sTCP:LISTEN |awk 'NR > 1 {print $$2}'|xargs kill -15 && nohup .build/debug/Run &
stop:
	lsof -i :8080 |awk 'NR > 1 {print $$2}'|xargs kill -15