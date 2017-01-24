
var  ValidationBox = React.createClass({
  handleSubmit: function(validation) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: validation,
      success: function(data) {
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  render: function() {
    return (
      <div className=" ValidationBox">
        <validationForm onvalidationSubmit={this.handleSubmit} />
      </div>
    );
  }
});

var validationForm = React.createClass({
  getInitialState: function() {
    return {
      contributor: ""
    };
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var contributor = this.state.contributor.trim();
    if (!contributor) {
      return;
    }
    
    this.props.onvalidationSubmit({contributor: contributor});
  },
  validateEmail: function (value) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },
  validateDollars: function (value) {
    var regex  = /^\$?[0-9]+(\.[0-9][0-9])?$/;
    return regex.test(value);
  },
  commonValidate: function () {
    return true;
  },
  setContributor: function (event) {
    this.setState({
      contributor: event.target.value
    });
  },
  render: function() {
    return (
      <form className="validationForm" onSubmit={this.handleSubmit}>
        <h2>University validation</h2>
      
        <TextInput
          uniqueName="email"
          text="Email Address"
          required={true}
          minCharacters={6}
          validate={this.validateEmail}
          onChange={this.handleEmailInput} 
          errorMessage="Email is invalid"
          emptyMessage="Email is required" />
        <br /><br />

        <TextInput
          ref="contributor"
          text="Your Name"
          uniqueName="contributor"
          required={true}
          minCharacters={3}
          validate={this.commonValidate}
          onChange={this.setContributor} 
          errorMessage="Name is invalid"
          emptyMessage="Name is required" />
        <br /><br />
      
        {}
        <h4>Where would you like your validation to go?</h4>
        <Department />
        <br /><br />
      
        {}
        <h4>How much would you like to give?</h4>
        <Radios
          values={[10, 25, 50]}
          name="amount"
          addAny={true}
          anyLabel=" Donate a custom amount"
          anyPlaceholder="Amount (0.00)"
          anyValidation={this.validateDollars}
          anyErrorMessage="Amount is not a valid dollar amount"
          itemLabel={' Donate $[VALUE]'} />
        <br /><br />
      
        <h4>Payment Information</h4>
        <Payment />
        <br />
      
        <input type="submit" value="Submit" />
      </form>
    );
  }
});
var InputError = React.createClass({
  getInitialState: function() {
    return {
      message: 'Input is invalid'
    };
  },
  render: function(){ 
    var errorClass = classNames(this.props.className, {
      'error_container':   true,
      'visible':           this.props.visible,
      'invisible':         !this.props.visible
    });

    return (
      <div className={errorClass}>
        <span>{this.props.errorMessage}</span>
      </div>
    )
  }

});

var TextInput = React.createClass({
  getInitialState: function(){
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false
    };
  },

  handleChange: function(event){
    this.validation(event.target.value);
    if(this.props.onChange) {
      this.props.onChange(event);
    }
  },

  validation: function (value, valid) {
    if (typeof valid === 'undefined') {
      valid = true;
    }
    
    var message = "";
    var errorVisible = false;
    
    if (!valid) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }
    else if (this.props.required && jQuery.isEmptyObject(value)) {
      message = this.props.emptyMessage;
      valid = false;
      errorVisible = true;
    }
    else if (value.length < this.props.minCharacters) {
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }
    this.setState({
      value: value,
      isEmpty: jQuery.isEmptyObject(value),
      valid: valid,
      errorMessage: message,
      errorVisible: errorVisible
    });

  },

  handleBlur: function (event) {
    var valid = this.props.validate(event.target.value);
    this.validation(event.target.value, valid);
  },
  render: function() {
    
    return (
      <div className={this.props.uniqueName}>
        <input
          placeholder={this.props.text}
          className={'input input-' + this.props.uniqueName}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={this.state.value} />
      
        <InputError 
          visible={this.state.errorVisible} 
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});

var Radios = React.createClass({
  getInitialState: function() {
    return {
      displayClass: 'invisible',
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false
    };
  },
  handleClick: function(displayClass, e) {
    if (displayClass == 'invisible') {
      this.setState(
        {
          displayClass: displayClass,
          errorVisible: false
        }
      );
    }
    else {
      this.setState({displayClass: displayClass});
    }
  },
  handleAnyChange: function(e) {
    if (this.props.anyValidation(e.target.value)) {
      this.setState(
        {
          valid: true,
          errorMessage: "Input is invalid",
          errorVisible: false
        }
      );
    }
    else {
      this.setState(
        {
          valid: false,
          errorMessage: this.props.anyErrorMessage,
          errorVisible: true
        }
      );
    }
  },
  render: function() {
    var rows = [];
    var label = "";
    
    for (var i = 0; i < this.props.values.length; i++) {
      label = this.props.itemLabel.replace('[VALUE]', this.props.values[i]);
      rows.push(<input
        key={this.props.name + '-' + i}
        type="radio"
        ref={this.props.name + '-' + this.props.values[i]}
        name={this.props.name}
        value={this.props.values[i]}
        onClick={this.handleClick.bind(this, 'invisible')} />,
        
        <label key={this.props.name + '-label-' + i} htmlFor={this.props.values[i]}>{label}</label>,
      
        <br key={this.props.name + '-br-' + i} />);
    }
    
    if (this.props.addAny) {
      label = this.props.anyLabel;
      rows.push(<input
        key={this.props.name + '-' + i}
        type="radio"
        ref={this.props.name + '-any'}
        name={this.props.name} value="any"
        onClick={this.handleClick.bind(this, 'visible')} />,
          
        <label key={this.props.name + '-label-' + i} htmlFor={this.props.values[i]}>{label}</label>);
      rows.push(<div key={this.props.name + '-div-' + (i+2)} className={this.state.displayClass}>
        <input
          className="anyValue"
          key={this.props.name + '-' + (i+1)}
          type="text"
          placeholder={this.props.anyPlaceholder}
          onChange={this.handleAnyChange}
          ref={this.props.name} />
      </div>);
    }
    
    return (
      <div className="radios">
        {rows}
        
        <InputError 
          visible={this.state.errorVisible} 
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});

var Payment = React.createClass({
  getInitialState: function() {
    return {
      displayClass: 'invisible'
    };
  },
  handleClick: function(displayClass, e) {
    this.setState({displayClass: displayClass});
  },
  render: function() {
    var optionsClass = "invisible";
    var isChecked = false;
    if (this.state.displayClass == 'invisible') {
      optionsClass = "visible";
    }
    else {
      isChecked = true;
    }
    
    return (
      <div className="payment">
        <a href="#">PayPal button goes here</a>
        <br />
        <input type="checkbox" checked={isChecked} onChange={this.handleClick.bind(this, optionsClass)} name="card" />Pay with card<br />
  	    <div id="Choices" className={this.state.displayClass}>Credit Card Information<br />
  		    <input type="text" placeholder="Card number" ref="card" />Card number<br />
  		    <input type="text" placeholder="CVV" ref="cvv" />CVV<br />
  		    <input type="text" placeholder="etc" ref="whatever" />Etc<br />
  	    </div>
        <InputError 
          visible={this.state.errorVisible} 
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});

var Department = React.createClass({
  getInitialState: function() {
    return {
      displayClass: 'invisible'
    };
  },
  handleClick: function(e) {
    var displayClass = 'invisible';
    if (e.target.value == 'other') {
      displayClass = 'visible';
    }
    this.setState({displayClass: displayClass});
  },
  render: function() {
    return (
      <div className="department">
        <select onChange={this.handleClick} multiple={false} ref="department">
          <option value="none"></option>
          <optgroup label="College">
            <option value="muir">Muir</option>
            <option value="revelle">Revelle</option>
            <option value="sixth">Sixth</option>
          </optgroup>
          <optgroup label="School">
            <option value="jacobs">Jacobs School of Engineering</option>
            <option value="global">School of Global Policy and Strategy</option>
            <option value="medicine">School of Medicine</option>
          </optgroup>
          <option value="scholarships">Scholarships</option>
          <option value="other">Other</option>
        </select>
        <div className={this.state.displayClass}>
          <input className="anyValue" type="text" placeholder="Department" ref="any-department" />
        </div>
      
        <InputError 
          visible={this.state.errorVisible} 
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});
ReactDOM.render(
  < ValidationBox url="validations.json" pollInterval={2000} />,
  document.getElementById('content')
);
