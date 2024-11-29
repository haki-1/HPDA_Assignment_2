import './Scatterplot.css'
import { useEffect, useRef } from 'react';
import {useSelector, useDispatch} from 'react-redux'

import ScatterplotD3 from './Scatterplot-d3';
import {updateSelection} from "../../redux/SelectedDataSlice";


// TODO: import action methods from reducers

function ScatterplotContainer(){
    const dataSetData = useSelector(state =>state.dataSet)
    const selectedDataData = useSelector(state =>state.selectedData)
    const dispatch = useDispatch();

    const xAttribute= "Temperature"
    const yAttribute= "RentedBikeCount"

    // every time the component re-render
    useEffect(()=>{
        console.log("ScatterplotContainer useEffect (called each time matrix re-renders)");
    }); // if no dependencies, useEffect is called at each re-render

    const divContainerRef=useRef(null);
    const scatterplotD3Ref = useRef(null)

    const getCharSize = function(){
        // fixed size
        // return {width:900, height:900};
        // getting size from parent item
        let width;// = 800;
        let height;// = 100;
        if(divContainerRef.current!==undefined){
            width=divContainerRef.current.offsetWidth;
            // width = '100%';
            height=divContainerRef.current.offsetHeight;
            // height = '100%';
        }
        return {width:width,height:height};
    }

    // did mount called once the component did mount
    useEffect(()=>{
        console.log("ScatterplotContainer useEffect [] called once the component did mount");
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({size:getCharSize()});
        scatterplotD3Ref.current = scatterplotD3;
        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            console.log("ScatterplotContainer useEffect [] return function, called when the component did unmount...");
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear()
        }
    },[]);// if empty array, useEffect is called after the component did mount (has been created)

    // did update, called each time dependencies change, dispatch remain stable over component cycles
    useEffect(()=>{
        console.log("ScatterplotContainer useEffect with dependency [dataSetData,dispatch], called each time dataSetData changes...");
        const scatterplotD3 = scatterplotD3Ref.current;

        const handleOnBrushEnd = function(payload){
            dispatch(updateSelection({visValue:1, data:payload}));
        }
        const controllerMethods={
            handleOnBrushEnd: handleOnBrushEnd,
        }
        scatterplotD3.renderScatterplot(dataSetData,xAttribute,yAttribute,controllerMethods);
    },[dataSetData,dispatch]);// if dependencies, useEffect is called after each data update, in our case only dataSetData changes.

        // did update, called each time dependencies change, dispatch remain stable over component cycles
        useEffect(()=>{
            console.log("ScatterplotContainer useEffect with dependency [selectedDataData,dispatch], called each time selectedDataData changes...");
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.renderScatterplotOnSelectionChange(selectedDataData);
        },[selectedDataData,dispatch]);// if dependencies, useEffect is called after each data update, in our case only selectedDataData changes.    

    return(
        <div ref={divContainerRef} className="scatterplotDivContainer col2">

        </div>
    )
}

export default ScatterplotContainer;