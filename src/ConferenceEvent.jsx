import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "./venueSlice";
import { toggleAVSelection } from "./avSlice";
import { toggleMealSelection } from "./mealsSlice";

const ConferenceEvent = () => {
  const dispatch = useDispatch();

  const venueItems = useSelector((state) => state.venue);
  const avItems = useSelector((state) => state.av);
  const mealsItems = useSelector((state) => state.meals);

  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [showItems, setShowItems] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleMealSelection = (index) => {
    const item = mealsItems[index];
    if (item.selected && item.type === "mealForPeople") {
      const newNumberOfPeople = item.selected ? numberOfPeople : 0;
      dispatch(toggleMealSelection(index, newNumberOfPeople));
    } else {
      dispatch(toggleMealSelection(index));
    }
  };

  const calculateTotalCost = (section) => {
    let totalCost = 0;
    if (section === "venue") {
      venueItems.forEach((item) => {
        totalCost += item.cost * item.quantity;
      });
    } else if (section === "av") {
      avItems.forEach((item) => {
        totalCost += item.cost * item.quantity;
      });
    } else if (section === "meals") {
      mealsItems.forEach((item) => {
        if (item.selected) {
          totalCost += item.cost * numberOfPeople;
        }
      });
    }
    return totalCost;
  };

  const venueTotalCost = calculateTotalCost("venue");
  const avTotalCost = calculateTotalCost("av");
  const mealsTotalCost = calculateTotalCost("meals");
  const grandTotal = venueTotalCost + avTotalCost + mealsTotalCost;

  // 🔹 Create totalCosts object
  const totalCosts = {
    venue: venueTotalCost,
    av: avTotalCost,
    meals: mealsTotalCost,
  };

  // 🔹 Collect all selected items
  const getItemsFromTotalCost = () => {
    const items = [];

    venueItems.forEach((item) => {
      if (item.quantity > 0) {
        items.push({ ...item, type: "venue" });
      }
    });

    avItems.forEach((item) => {
      if (
        item.quantity > 0 &&
        !items.some((i) => i.name === item.name && i.type === "av")
      ) {
        items.push({ ...item, type: "av" });
      }
    });

    mealsItems.forEach((item) => {
      if (item.selected) {
        const itemForDisplay = { ...item, type: "meals" };
        if (item.numberOfPeople) {
          itemForDisplay.numberOfPeople = numberOfPeople;
        }
        items.push(itemForDisplay);
      }
    });

    return items;
  };

  const items = getItemsFromTotalCost();

  return (
    <div className="main_container">
      {/* 🔹 Navbar */}
      <nav className="navbar">
        <h1>Conference Expense Planner</h1>
        {showItems && (
          <button
            className="show_details_btn"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        )}
      </nav>

      {/* 🔹 Landing Page or Selection Page */}
      {!showItems ? (
        <div className="landing_page">
          <h2>Welcome to the Conference Planner</h2>
          <p>Plan your event and manage your costs easily!</p>
          <button className="get_started_btn" onClick={() => setShowItems(true)}>
            Get Started
          </button>
        </div>
      ) : (
        <div className="items-information">
          {/* VENUE SECTION */}
          <div className="venue_container container_main">
            <h2>Room Selection</h2>
            {venueItems.map((item, index) => (
              <div className="venue_item" key={index}>
                <div className="venue_name">{item.name}</div>
                <div className="venue_cost">${item.cost}</div>
                <div className="quantity_control">
                  <button onClick={() => dispatch(decrement(index))}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(increment(index))}>+</button>
                </div>
              </div>
            ))}
            <div className="total_cost">Total: ${venueTotalCost}</div>
          </div>

          {/* AV SECTION */}
          <div className="venue_container container_main">
            <h2>Audio Visual Equipment</h2>
            {avItems.map((item, index) => (
              <div className="av_item" key={index}>
                <div className="av_name">{item.name}</div>
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => dispatch(toggleAVSelection(index))}
                />
                <div className="av_cost">${item.cost}</div>
              </div>
            ))}
            <div className="total_cost">Total: ${avTotalCost}</div>
          </div>

          {/* MEAL SECTION */}
          <div className="venue_container container_main">
            <h2>Meal Selection</h2>

            <div className="input-container venue_selection">
              <label htmlFor="numberOfPeople">
                <h3>Number of People:</h3>
              </label>
              <input
                type="number"
                className="input_box5"
                id="numberOfPeople"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                min="1"
              />
            </div>

            <div className="meal_selection">
              {mealsItems.map((item, index) => (
                <div className="meal_item" key={index} style={{ padding: 15 }}>
                  <div className="inner">
                    <input
                      type="checkbox"
                      id={`meal_${index}`}
                      checked={item.selected}
                      onChange={() => handleMealSelection(index)}
                    />
                    <label htmlFor={`meal_${index}`}>{item.name}</label>
                  </div>
                  <div className="meal_cost">${item.cost}</div>
                </div>
              ))}
            </div>

            <div className="total_cost">Total Cost: ${mealsTotalCost}</div>
          </div>

          {/* 🔹 TOTAL AND DETAILS */}
          <div className="total_amount_detail">
            <TotalCost
              totalCosts={totalCosts}
              ItemsDisplay={() => <ItemsDisplay items={items} numberOfPeople={numberOfPeople} />}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// 🔹 COMPONENT: TotalCost
const TotalCost = ({ totalCosts, ItemsDisplay }) => {
  const total =
    totalCosts.venue + totalCosts.av + totalCosts.meals;

  return (
    <div className="total_cost_section">
      <h3>Summary of Costs</h3>
      <p>Venue Total: ${totalCosts.venue}</p>
      <p>AV Total: ${totalCosts.av}</p>
      <p>Meals Total: ${totalCosts.meals}</p>
      <h2>Grand Total: ${total}</h2>
      <ItemsDisplay />
    </div>
  );
};

// 🔹 COMPONENT: ItemsDisplay
const ItemsDisplay = ({ items, numberOfPeople }) => {
  console.log(items);
  return (
    <>
      <div className="display_box1">
        {items.length === 0 && <p>No items selected</p>}
        {items.length > 0 && (
          <table className="table_item_data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit Cost</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>${item.cost}</td>
                  <td>
                    {item.type === "meals" || item.numberOfPeople
                      ? `For ${numberOfPeople} people`
                      : item.quantity}
                  </td>
                  <td>
                    {item.type === "meals" || item.numberOfPeople
                      ? `$${item.cost * numberOfPeople}`
                      : `$${item.cost * item.quantity}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ConferenceEvent;
