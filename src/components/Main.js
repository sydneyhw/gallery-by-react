require('normalize.css/normalize.css');
require('styles/App.scss');
import React from 'react';
import ReactDOM from 'react-dom';
//获取图片相关数据
var imageData = require('../data/imageData.json');
//定义函数将图片名信息转为图片URL路径信息，调用函数添加url属性
imageData = (function genImageURL(imageDatasArr) {
	for (var i = 0, len = imageDatasArr.length; i < len; i++) {
		var singleImageData = imageDatasArr[i];

		singleImageData.imageURL = require('../images/' + singleImageData.fileName);
		imageDatasArr[i] = singleImageData;
	}
	return imageDatasArr;
})(imageData);



//获取区间内随机值
function getRangeRandom(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}
//获取30度之间任意正负值
function get30Random(low, high) {
	return (Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30)
}


//图片组件
var ImgFigure = React.createClass({
	clickHandler: function(e) {
		if (this.props.arrange.isCenter) {
			this.props.inverse();
		} else {
			this.props.center();
		}

		e.stopPropagation();
		e.preventDefault();



	},
	render: function() {
		var styleObj = {};
		//如果props属性中指定了位置则使用
		if (this.props.arrange.pos) {
			styleObj = this.props.arrange.pos;
		}
		//如果图片旋转属性有值而且不为0，添加旋转角度
		if (this.props.arrange.rotate) {
			['moz', 'ms', 'webkit', ''].forEach(function(value) {
				styleObj[value + 'transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';

			}.bind(this));

		}
		if (this.props.arrange.isCenter) {
			styleObj.zIndex = 11;
		}
		var imgFigureClassName = "img-figure";
		imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';
		return (
			<figure className={imgFigureClassName} style={styleObj} onClick={this.clickHandler}> 
			<img src={this.props.data.imageURL}
		         alt={this.props.data.title}
			/>
			<figcaption>
			<h2 className='img-title'>{this.props.data.title}</h2>
			<div className='img-back' onClick={this.clickHandler}>
			<p>
				{this.props.data.desc}
			</p>
			</div>
			</figcaption>
			</figure>
		);
	}
});
//管理者模式，大管家掌控舞台 
var GalleryApp = React.createClass({
	//各个位置点（定义时先初始化为0，后面再重新初始化赋值）
	Constant: {
		centerPos: {
			left: 0,
			right: 0
		},
		hPosRange: { //左右分区的取值范围
			leftSecX: [0, 0],
			rightSecX: [0, 0],
			y: [0, 0]
		},
		vPosRange: { //上分区的取值范围
			x: [0, 0],
			topY: [0, 0]
		}
	},
	inverse: function(index) {
		return function() {
			var imgsArrangeArr = this.state.imgsArrangeArr;
			imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
			this.setState({
				imgsArrangeArr: imgsArrangeArr
			});


		}.bind(this);

	},
	//重新布局所有图片,参数：centerIndex指定哪个图片居中
	rearrange: function(centerIndex) {

		var imgsArrangeArr = this.state.imgsArrangeArr,
			Constant = this.Constant,
			centerPos = Constant.centerPos,
			hPosRange = Constant.hPosRange,
			vPosRange = Constant.vPosRange,
			hPosRangeLeftSecX = hPosRange.leftSecX,
			hPosRangeRightSecX = hPosRange.rightSecX,
			hPosRangeY = hPosRange.y,
			vPosRangeTopY = vPosRange.topY,
			vPosRangeX = vPosRange.x,

			imgsArrangeTopArr = [],
			topImgNum = Math.floor(Math.random() * 2), //取1个或不取  左闭右开
			topImgSpliceIndex = 0, //标记上分区的图片是从数组中的哪个位置拿出来的

			//取出要布局居中的图片的状态信息
			imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
		imgsArrangeCenterArr[0].pos = centerPos;
		//居中图片不需要旋转
		imgsArrangeCenterArr[0].rotate = 0;
		imgsArrangeCenterArr[0].isCenter = true;
		//splice() 方法可删除从 index 处开始的零个或多个元素，并且用参数列表中声明的一个或多个值来替换那些被删除的元素。
		//如果从 arrayObject 中删除了元素，则返回的是含有被删除的元素的数组。

		//取出要布局上侧的图片的状态信息
		topImgSpliceIndex = Math.floor(Math.random() * (imgsArrangeArr.length - topImgNum));
		imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);
		//布局位于上侧的图片
		imgsArrangeTopArr.forEach(function(value, index) {

			imgsArrangeTopArr[index] = {
				pos: {
					top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
					left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
				},
				rotate: get30Random(),
				isCenter: false
			};

		});

		//布局左右两侧的图片
		for (var i = 0, len = imgsArrangeArr.length, k = len / 2; i < len; i++) {
			var hPosRangeLORX = null;

			//前半部分布局左边，后半部分布局右边
			if (i < k) {
				hPosRangeLORX = hPosRangeLeftSecX;
			} else {
				hPosRangeLORX = hPosRangeRightSecX;
			}

			imgsArrangeArr[i] = {
				pos: {
					top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
					left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
				},
				rotate: get30Random(),
				isCenter: false
			};
		}

		//将取出的图片信息合并回去
		if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
			imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
		}

		imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

		//触发重新渲染
		this.setState({
			imgsArrangeArr: imgsArrangeArr
		});
	},
	//初始化状态
	getInitialState: function() {
		return {
			//多个图片状态数组
			imgsArrangeArr: [
				// {
				// 	pos:{
				// 		left:'0',
				// 		top:'0',
				// 	}
				// 	rotate:0,
				// 	isInverse:0,
				// 	isCenter:false
				// 	
				// 	}
				// 	
				// }
			]
		}
	},
	center: function(index) {
		return function() {
			this.rearrange(index);
		}.bind(this);
	},
	componentDidMount: function() {
		//首先拿到stage大小
		var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
			stageW = stageDOM.scrollWidth,
			stageH = stageDOM.scrollHeight,
			halfStageW = Math.floor(stageW / 2),
			halfStageH = Math.floor(stageH / 2);


		//拿到一个imageFigure的大小
		var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
			imgW = imgFigureDOM.scrollWidth,
			imgH = imgFigureDOM.scrollHeight,
			halfImgW = Math.floor(imgW / 2),
			halfImgH = Math.floor(imgH / 2);


		//计算中心图片的位置点
		this.Constant.centerPos = {
			left: halfStageW - halfImgW,
			top: halfStageH - halfImgH
		};
		//计算左 右侧区域图片排布位置的取值范围
		this.Constant.hPosRange.leftSecX[0] = -halfImgW;
		this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
		this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
		this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
		this.Constant.hPosRange.y[0] = -halfImgH;
		this.Constant.hPosRange.y[1] = stageH - halfImgH;

		//计算上侧区域图片排布位置的取值范围
		this.Constant.vPosRange.topY[0] = -halfImgH;
		this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
		this.Constant.vPosRange.x[0] = halfStageW - imgW;
		this.Constant.vPosRange.x[1] = halfStageW;
		//初始化让第0张居中
		this.rearrange(0);

	},
	render: function() {
		var controllerUnits = [],
			imgFigures = [];
		imageData.forEach(function(value, index) {
			//初始化状态对象，都定位在左上角
			//console.log(this.state.imgsArrangeArr);
			if (!this.state.imgsArrangeArr[index]) {
				this.state.imgsArrangeArr[index] = {
					pos: {
						left: 0,
						top: 0
					},
					rotate: 0,
					isInverse: 0,
					isCenter: false

				};
			}

			imgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure' + index}
                                 arrange={this.state.imgsArrangeArr[index]}
                                inverse = {this.inverse(index)} center={this.center(index)}/>);
		}.bind(this)); //添加索引方便定位图片位置，bind(this)将component对象传递到function中,将状态和索引值对应起来



		return (
			<section className="stage" ref="stage">
			<section className="img-sec">
			{imgFigures}
			</section>
			<nav className="controller-nav">
		{
			controllerUnits
		}
			</nav>
			</section>

		);
	}
})

ReactDOM.render(<GalleryApp/>, document.getElementById("app"));
export default GalleryApp;