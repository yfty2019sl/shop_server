const express = require("express");
const app = express();
const port = 3000;

// mysql相关
const mysql = require("mysql");
// 创建连接池
const pool = mysql.createPool({
	host: "localhost",
	user: "root",
	password: "1234",
	database: "kaixin_diancan",
	connectionLimit: 10,
});

// 跨域
app.use(require("cors")());

// 处理post请求
const bodyParser = require("body-parser");
const { json } = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// 查询商品
app.get("/api/goods", (req, res) => {
	// limit
	let l = 10;
	// 当前页数
	let pageNo = req.query.pageNo;
	// offset
	let o = l * (pageNo - 1);
	// 查询条件cateId
	let cId = "";

	switch (req.query.cate) {
		case "re":
			cId = "1";
			break;
		case "tang":
			cId = "2";
			break;
		case "liang":
			cId = "3";
			break;
		case "zhu":
			cId = "4";
			break;
		case "bai":
			cId = "5";
			break;
		case "hong":
			cId = "6";
			break;
		case "pi":
			cId = "7";
			break;
		case "yin":
			cId = "8";
			break;
	}
	// 查询语句
	let goodsCountStr = `SELECT count(id) as goods_count FROM t_goods WHERE cate_id in (${cId});`;
	let goodsStr = `SELECT * FROM t_goods WHERE cate_id in (${cId}) ORDER BY cate_id ASC LIMIT ${l} OFFSET ${o};`;

	// 要返回的数据
	let data = { count: 0, goods: [] };

	// 查询
	pool.getConnection((err, conn) => {
		if (err) {
			console.log("连接池错误：", err);
		} else {
			conn.query(goodsStr, (err, result) => {
				if (err) {
					console.log("[SELECT ERROR - ]", err.message);
				} else {
					data.goods = result;
				}
			});
			conn.query(goodsCountStr, (err, result) => {
				if (err) {
					console.log("[SELECT ERROR - ]", err.message);
				} else {
					data.count = result[0].goods_count;
				}

				res.json(data);
			});
		}
		conn.release();
	});
});

// 提交订单
app.post("/api/order", (req, res) => {
	console.log(req.body);
	let orderId = req.body.orderId;
	let tableNo = req.body.tableNo;
	let createDate = req.body.createDate;
	let createTime = req.body.createTime;

	let completedDate = req.body.completedDate;
	let completedTime = req.body.completedTime;
	let list = JSON.stringify(req.body.list);
	let totalPrice = req.body.totalPrice;
	let sql = "";
	if (orderId === null) {
		sql = `INSERT INTO t_orders (table_no,create_date,create_time,completed_date,completed_time,list,total_price)
	VALUES
	(${tableNo},'${createDate}','${createTime}','${completedDate}','${completedTime}','${list}',${totalPrice});`;
	} else {
		sql = `UPDATE t_orders SET list='${list}' WHERE id = ${orderId};`;
	}

	pool.getConnection((err, conn) => {
		if (err) {
			console.log("连接池错误");
		} else {
			conn.query(sql, (err, result) => {
				if (err) {
					console.log("数据库存储订单错误！", err);
				} else {
					res.json(result);
				}
			});
		}
		conn.release();
	});
});

// 获取所有订单
app.get("/api/orders", (req, res) => {
	let sql = `SELECT * FROM t_orders WHERE to_days(create_date) = to_days(now());`;
	pool.getConnection((err, conn) => {
		if (err) {
			console.log("连接池错误");
		} else {
			conn.query(sql, (err, result) => {
				if (err) {
					console.log("查询今日订单错误：", err);
				} else {
					res.json(result);
				}
			});
		}
		conn.release();
	});
});

// 根据id获取订单
app.get("/api/order", (req, res) => {
	let orderId = req.query.orderId;
	let sql = `SELECT * FROM t_orders WHERE id = ${orderId};`;
	pool.getConnection((err, conn) => {
		if (err) {
			console.log("连接池错误");
		} else {
			conn.query(sql, (err, result) => {
				if (err) {
					console.log("根据Id查询订单错误：", err);
				} else {
					res.json(result);
				}
			});
		}
	});
});

app.listen(port, () => {
	console.log("服务器已经启动，正在监听3000端口。。。");
});
