import * as d3 from 'd3'
import { getDefaultFontSize } from '../../utils/helper';

class ScatterplotD3 {
    margin = {top: 100, right: 50, bottom: 50, left: 50};
    size;
    height;
    width;
    matSvg;
    // add specific class properties used for the vis render/updates
    // cellSize= 34;
    // radius = this.cellSize / 2;
    // colorScheme = d3.schemeYlGnBu[9];
    // cellColorScale = d3.scaleQuantile(this.colorScheme);
    // cellSizeScale = d3.scaleLinear()
    //     .range([2, this.radius-1])
    // ;
    xScale;
    yScale;
    transitionDuration=1000;
    circleRadius = 1;

    mouseDown = false;
    valuesSelected = [];


    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};

        // adapt the size locally if necessary
        // e.g. to create a square svg
        // if (this.size.width > this.size.height) {
        //     this.size.width = this.size.height;
        // } else {
        //     this.size.height = this.size.width;
        // }

        // get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        // initialize the svg and keep it in a class property to reuse it in renderMatrix()
        this.matSvg=d3.select(this.el).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("class","matSvgG")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        ;
        this.xScale = d3.scaleLinear().range([0,this.width]);
        this.yScale = d3.scaleLinear().range([this.height,0]);

        // build xAxisG
        this.matSvg.append("g")
            .attr("class","xAxisG")
            .attr("transform","translate(0,"+this.height+")")
        ;
        this.matSvg.append("g")
            .attr("class","yAxisG")
        ;
    }

    updateFunction1(selection, xAttribute, yAttribute){
        // transform selection
        // selection.attr("transform", (itemData)=>{
        //      // use scales to return shape position from data values
        // })
        selection
            .transition().duration(this.transitionDuration)
            .attr("transform", (item)=>{
                // use scales to return shape position from data values
                const xPos = this.xScale(item[xAttribute])// ? new Date(item[xAttribute].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")) : NaN);
                const yPos = this.yScale(item[yAttribute]);
                return "translate("+xPos+","+yPos+")";
            })


        // change sub-element
        // selection.select(".classname")
        //    .attr("fill",(itemData)=>{
        //          // use scale to return visual attribute from data values
        //    })
    }

    updateAxis = function(visData,xAttribute,yAttribute){
        const minX = d3.min(visData.map(item=> item[xAttribute]));// ? new Date(item[xAttribute].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")) : NaN));
        const maxX = d3.max(visData.map(item=> item[xAttribute]));// ? new Date(item[xAttribute].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1")) : NaN));
        // this.xScale.domain([0, maxX]);
        this.xScale.domain([minX, maxX]);
        const minY = d3.min(visData.map(item=>item[yAttribute]));
        const maxY = d3.max(visData.map(item=>item[yAttribute]));
        // this.yScale.domain([0, maxY]);
        this.yScale.domain([minY, maxY]);

        this.matSvg.select(".xAxisG")
            .transition().duration(this.transitionDuration)
            // .call(d3.axisBottom(this.xScale).tickFormat(d3.utcFormat("%d/%m/%Y")))
            .call(d3.axisBottom(this.xScale))
        ;
        this.matSvg.select(".yAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisLeft(this.yScale))
        ;
    }


    renderVis = function (visData, xAttribute, yAttribute, controllerMethods){
        // build the size scale from the data
        // const minVal =
        // const maxValo =
        // this.scale1.domain([minVal, maxVal])
        this.updateAxis(visData,xAttribute,yAttribute);

        this.matSvg.selectAll(".itemG")
            // all elements with the class .cellG (empty the first time)
            .data(visData,(itemData)=>itemData.index)
            .join(
                enter=>{
                    // all data items to add:
                    // doesn’exist in the select but exist in the new array
                    const itemG=enter.append("g")
                        .attr("class","itemG")
                        // .on("event1", (event,itemData)=>{
                        //     controllerMethods.handleOnEvent1(itemData);
                        // })
                        // .on("event2",(event,itemData)=>{
                        //     controllerMethods.handleOnEvent2(itemData);
                        // })                        
                    ;

                    // render element as child of each element "g"
                    itemG.append("circle")
                        .attr("class","dotCircle")
                        .attr("r",this.circleRadius)
                        //.attr("stroke","red")
                    // ...
                    ;
                    this.updateFunction1(itemG,xAttribute,yAttribute);

                    this.matSvg.call(d3.brush().on("start brush end", ({selection}) => {
                        let value = [];
                        if (selection) {
                          const [[x0, y0], [x1, y1]] = selection;
                          value = itemG
                            .style("stroke", "gray")
                            // .filter(d => x0 <= this.xScale(new Date(d[xAttribute].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"))) && this.xScale(new Date(d[xAttribute].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"))) < x1
                            .filter(d => x0 <= this.xScale(d[xAttribute]) && this.xScale(d[xAttribute]) < x1
                                    && y0 <= this.yScale(d[yAttribute]) && this.yScale(d[yAttribute]) < y1)
                            .style("stroke", "steelblue")
                            .data()
                            ;
                        } else {
                            itemG.style("stroke", "steelblue");
                        }
                        // Inform downstream cells that the selection has changed.
                        this.matSvg.property("value", value).dispatch("input");
                        this.valuesSelected = value;
                        controllerMethods.handleOnEvent1(this.valuesSelected);
                      }))
                },
                update=>{this.updateFunction1(update,xAttribute,yAttribute)},
                exit =>{
                    exit.remove()
                    ;
                }

            )

    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default ScatterplotD3;