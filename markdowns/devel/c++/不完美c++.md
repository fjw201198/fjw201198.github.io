# 不完美C++技巧

> 《不完美C++》(Imperfect C++) 这本书太精彩了. 充分利用了c++语言的特性,为我们讲解了一个既熟悉又陌生的C++. 看完本书, 让人豁然开朗, 原来这个C++还能这么用.

[TOC]

## 必须要有基类

> C++允许基类指针指向派生类（public继承），故而可以通过该技巧，检测两个类之间是否存在派生关系。通过将约需定义成static私有方法，从而减少运行时代价，然而如果不被调用，编译器可能会优化掉，所有可以通过在析构函数中赋一下值来强制编译器检测。可以通过重载来确保这两个类不是同一个类。

[must_have_base](https://coding.net/u/dayelaiwanya/p/LearnCode/git/blob/master/must_have_base.cpp)

```c++
// D: 派生类, B: 基类
// 定义两个重载的constraints来确保D和B是不同的类型
// 定义成私有的确保不有被外部调用
// 析构函数中的简单复制确保编译器会检查约束，而不被优化掉。
template<typename D, typename B>
class must_have_base {
public:
  must_have_base() { }
  ~must_have_base() {
    void (*p)(D*, B*) = constraints;
    void (*q)(B*, D*) = constraints;
  }
private:
  static void constraints(D* d, B* p) {
    p = d;
  }

  static void constraints(B* p, D* d) {
    p = d;
  }
};
```

**注：该方法只适用于公有继承，而不适合私有继承。**

## 必须要支持下标访问

> 通过通过调用下标访问检测某类型是否支持下表访问。（这里sizeof是个好东西，可以接受任意类型的参数，并且返回固定类型的值 :smile:。）

[must_have_subscriptable](https://coding.net/u/dayelaiwanya/p/LearnCode/git/blob/master/must_be_scriptable.cpp)

```c++
// 注意约束里的sizeof和赋值，没有赋值则编译器会产生警告，挺啰嗦的；
// 而没有sizeof则不知道返回什么类型。
template<typename T>
struct must_be_scriptable {
  ~must_be_scriptable() {
    void (*p)(T const&) = constraints;
  }
  static void constraints(T const& T_is_not_subscriptable) {
    size_t sz = sizeof(T_is_not_subscriptable[0]);
  }
};
```

## 必须是原生指针

> 对于原生指针，下标访问时，索引和变量名的位置是可以互换的，如`a[0]` 和`0[a]`是一样的，但是重载了`operator []`的类型是只能是第一种顺序。故而可以通过该技巧限制原生指针。

[must_be_decayable_pointer](https://coding.net/u/dayelaiwanya/p/LearnCode/git/blob/master/must_be_orignal_pointer.cpp)

```c++
// int *a;
// a[0] equal to 0[a];
template<typename T>
struct must_be_original {
  ~must_be_original() {
    void (*p)(T const&) = constraints;
  }
  
  static void constraints(T const& T_is_not_orignal_pointer) {
    size_t sz = sizeof(0[T_is_not_subscriptable]);
  }
};
```

